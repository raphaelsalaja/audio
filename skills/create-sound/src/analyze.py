"""
Shared FFT helpers for the interpret-* rules in skills/create-sound.

Ported from skills/interpret-sounds/reference.md so each interpret rule
can `from analyze import ...` instead of duplicating the math.

Dependencies: numpy, scipy. ffmpeg is required as a CLI for source
acquisition (handled outside this module).
"""

from __future__ import annotations

import numpy as np
from scipy.fft import rfft, rfftfreq
from scipy.signal import find_peaks


def load_mono(path: str):
    """Read a WAV file and return (sample_rate, mono_samples)."""
    from scipy.io import wavfile

    sample_rate, data = wavfile.read(path)
    if data.ndim > 1:
        data = data[:, 0]
    return sample_rate, data


def analyze_slice(data, sample_rate: int, start_ms: float, window_ms: float = 10):
    """FFT a short window and return the peak frequency in Hz, or None if empty."""
    start = int(sample_rate * start_ms / 1000)
    end = start + int(sample_rate * window_ms / 1000)
    segment = data[start:end].astype(float)
    if len(segment) == 0:
        return None
    segment *= np.hanning(len(segment))
    spectrum = np.abs(rfft(segment))
    freqs = rfftfreq(len(segment), 1 / sample_rate)
    peak_idx = np.argmax(spectrum[1:]) + 1
    return freqs[peak_idx]


def extract_envelope(data, sample_rate: int, noise_floor_db: float = -40):
    """Estimate ADSR (attack, decay, sustain, release) from time-domain amplitude."""
    amplitude = np.abs(data.astype(float))
    window = int(sample_rate * 0.001)
    smoothed = np.convolve(amplitude, np.ones(window) / window, mode="same")

    noise_floor = np.max(smoothed) * 10 ** (noise_floor_db / 20)
    peak_idx = int(np.argmax(smoothed))
    peak_amp = smoothed[peak_idx]

    onset = int(np.argmax(smoothed > noise_floor))
    attack_s = (peak_idx - onset) / sample_rate

    active_end = len(smoothed) - 1 - int(np.argmax(smoothed[::-1] > noise_floor))
    mid_start = peak_idx + int((active_end - peak_idx) * 0.3)
    mid_end = peak_idx + int((active_end - peak_idx) * 0.7)
    if mid_end > mid_start:
        sustain_amp = float(np.mean(smoothed[mid_start:mid_end]))
        sustain_ratio = sustain_amp / peak_amp if peak_amp > 0 else 0
    else:
        sustain_ratio = 0

    if sustain_ratio > 0.01:
        sustain_threshold = peak_amp * sustain_ratio * 1.1
        decay_end = peak_idx + int(np.argmax(smoothed[peak_idx:] < sustain_threshold))
        decay_s = (decay_end - peak_idx) / sample_rate
    else:
        decay_s = (active_end - peak_idx) / sample_rate

    release_start = active_end - int((active_end - peak_idx) * 0.1)
    release_s = (active_end - release_start) / sample_rate

    return {
        "attack": round(attack_s, 4),
        "decay": round(decay_s, 4),
        "sustain": round(max(0, min(1, sustain_ratio)), 3),
        "release": round(max(0.005, release_s), 4),
    }


def classify_waveform(spectrum, freqs, fundamental_freq: float) -> str:
    """Classify oscillator type from harmonic ratios."""
    harmonics = []
    for n in range(2, 9):
        target = fundamental_freq * n
        idx = int(np.argmin(np.abs(freqs - target)))
        harmonics.append(spectrum[idx])
    fund_amp = spectrum[int(np.argmin(np.abs(freqs - fundamental_freq)))]
    if fund_amp == 0:
        return "noise"
    ratios = [h / fund_amp for h in harmonics]

    if all(r < 0.01 for r in ratios):
        return "sine"
    odd_only = all(ratios[i] < 0.05 for i in [0, 2, 4])
    if odd_only and ratios[1] > 0.05:
        return "square" if ratios[1] > 0.3 else "triangle"
    if all(r > 0.01 for r in ratios[:4]):
        return "sawtooth"
    return "wavetable"


def spectral_centroid(spectrum, freqs):
    s = float(np.sum(spectrum))
    return float(np.sum(freqs * spectrum) / s) if s > 0 else 0.0


def estimate_resonance(spectrum, freqs, cutoff_hz: float, bandwidth_hz: float = 200):
    cutoff_region = (freqs > cutoff_hz - bandwidth_hz) & (freqs < cutoff_hz + bandwidth_hz)
    if not np.any(cutoff_region):
        return 1.0
    peak_in_region = float(np.max(spectrum[cutoff_region]))
    baseline_mask = (freqs > cutoff_hz * 0.3) & (freqs < cutoff_hz * 0.7)
    baseline = float(np.mean(spectrum[baseline_mask])) if np.any(baseline_mask) else 0.0
    if baseline == 0:
        return 1.0
    return round(max(0.1, min(20.0, peak_in_region / baseline)), 1)


def detect_filter_envelope(data, sample_rate: int, slices_ms=(0, 5, 10, 20, 50, 100)):
    centroids = []
    for t in slices_ms:
        start = int(sample_rate * t / 1000)
        end = start + int(sample_rate * 0.01)
        segment = data[start:end].astype(float)
        if len(segment) == 0:
            break
        segment *= np.hanning(len(segment))
        spectrum = np.abs(rfft(segment))
        freqs = rfftfreq(len(segment), 1 / sample_rate)
        centroids.append(spectral_centroid(spectrum, freqs))

    if len(centroids) < 2:
        return None
    if centroids[0] > centroids[-1] * 1.5:
        return {
            "peak": round(centroids[0]),
            "resting": round(centroids[-1]),
            "decay_ms": slices_ms[len(centroids) - 1],
        }
    return None


def detect_reverb(data, sample_rate: int, envelope_end_ms: float):
    start = int(sample_rate * envelope_end_ms / 1000)
    tail = data[start:].astype(float)
    if len(tail) == 0:
        return None
    amplitude = np.abs(tail)
    noise_floor = float(np.max(np.abs(data.astype(float)))) * 0.001
    tail_end = int(np.argmax(amplitude[::-1] > noise_floor))
    tail_duration_s = (len(tail) - tail_end) / sample_rate
    if tail_duration_s > 0.05:
        return {"type": "reverb", "decay": round(tail_duration_s, 2)}
    return None


def detect_delay(data, sample_rate: int, min_delay_ms: int = 20, max_delay_ms: int = 1000):
    signal = data.astype(float)
    signal = signal / (float(np.max(np.abs(signal))) + 1e-10)

    min_lag = int(sample_rate * min_delay_ms / 1000)
    max_lag = int(sample_rate * max_delay_ms / 1000)
    max_lag = min(max_lag, len(signal) - 1)

    autocorr = np.correlate(signal[: max_lag * 2], signal[: max_lag * 2], mode="full")
    autocorr = autocorr[len(autocorr) // 2 :]

    peaks, _ = find_peaks(autocorr[min_lag:max_lag], height=0.1 * autocorr[0])
    if len(peaks) > 0:
        delay_samples = int(peaks[0]) + min_lag
        delay_time = delay_samples / sample_rate
        feedback = autocorr[delay_samples] / autocorr[0] if autocorr[0] > 0 else 0
        return {
            "type": "delay",
            "time": round(delay_time, 3),
            "feedback": round(max(0, min(0.95, float(feedback))), 2),
        }
    return None


def detect_lfo(parameter_over_time, sample_rate_of_measurements: float):
    centered = parameter_over_time - np.mean(parameter_over_time)
    spectrum = np.abs(rfft(centered))
    freqs = rfftfreq(len(centered), 1 / sample_rate_of_measurements)

    lfo_mask = (freqs > 0.1) & (freqs < 20)
    if not np.any(lfo_mask):
        return None

    lfo_spectrum = spectrum.copy()
    lfo_spectrum[~lfo_mask] = 0
    peak_idx = int(np.argmax(lfo_spectrum))

    if spectrum[peak_idx] > float(np.mean(spectrum)) * 3:
        rate = float(freqs[peak_idx])
        depth = float(np.max(parameter_over_time) - np.min(parameter_over_time)) / 2
        return {"frequency": round(rate, 1), "depth": round(depth, 4)}
    return None


def analyze_stereo(data):
    if data.ndim < 2:
        return {"pan": 0, "stereo_width": 0}

    left = data[:, 0].astype(float)
    right = data[:, 1].astype(float)

    l_rms = float(np.sqrt(np.mean(left ** 2)))
    r_rms = float(np.sqrt(np.mean(right ** 2)))

    if l_rms + r_rms == 0:
        return {"pan": 0, "stereo_width": 0}

    pan = (r_rms - l_rms) / (r_rms + l_rms)
    correlation = float(np.corrcoef(left, right)[0, 1])
    stereo_width = 1.0 - abs(correlation)
    return {"pan": round(pan, 2), "stereo_width": round(stereo_width, 2)}


def extract_harmonics(spectrum, freqs, fundamental_freq: float, num_harmonics: int = 16):
    fund_amp = spectrum[int(np.argmin(np.abs(freqs - fundamental_freq)))]
    if fund_amp == 0:
        return [1.0] + [0.0] * (num_harmonics - 1)

    harmonics = []
    for n in range(1, num_harmonics + 1):
        target = fundamental_freq * n
        if target > freqs[-1]:
            harmonics.append(0.0)
        else:
            idx = int(np.argmin(np.abs(freqs - target)))
            harmonics.append(round(float(spectrum[idx] / fund_amp), 4))
    return harmonics


def classify_noise_color(spectrum, freqs) -> str:
    mask = (freqs > 100) & (freqs < 10000)
    log_freqs = np.log10(freqs[mask])
    log_power = 20 * np.log10(spectrum[mask] + 1e-10)
    slope = float(np.polyfit(log_freqs, log_power, 1)[0])
    if abs(slope) < 1.5:
        return "white"
    if abs(slope) < 4.5:
        return "pink"
    return "brown"


def detect_fm(spectrum, freqs, fundamental_freq: float):
    peak_indices, _ = find_peaks(spectrum, height=float(np.max(spectrum)) * 0.05)
    peak_freqs = freqs[peak_indices]

    non_harmonic = []
    for f in peak_freqs:
        ratio = f / fundamental_freq
        if abs(ratio - round(ratio)) > 0.05:
            non_harmonic.append(float(f))

    if len(non_harmonic) >= 2:
        spacings = np.diff(sorted(non_harmonic))
        mod_freq = float(np.median(spacings))
        depth = len(non_harmonic)
        return {
            "fm": {
                "ratio": round(mod_freq / fundamental_freq, 2),
                "depth": min(1000, round(depth * 100)),
            }
        }
    return None
