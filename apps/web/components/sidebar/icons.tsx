import Atom from "@audio-kit/icons/fill-duo/atom";
import CircleWaveformLines from "@audio-kit/icons/fill-duo/circle-waveform-lines";
import ClockRotateClockwise from "@audio-kit/icons/fill-duo/clock-rotate-clockwise";
import Code from "@audio-kit/icons/fill-duo/code";
import ConnectedDots from "@audio-kit/icons/fill-duo/connected-dots";
import Dial from "@audio-kit/icons/fill-duo/dial";
import Download from "@audio-kit/icons/fill-duo/download";
import Equalizer from "@audio-kit/icons/fill-duo/equalizer";
import Headphones from "@audio-kit/icons/fill-duo/headphones";
import Layers from "@audio-kit/icons/fill-duo/layers";
import MapSearch from "@audio-kit/icons/fill-duo/map-search";
import MediaPlay from "@audio-kit/icons/fill-duo/media-play";
import Music from "@audio-kit/icons/fill-duo/music";
import MusicNote from "@audio-kit/icons/fill-duo/music-note";
import MusicPlaylist from "@audio-kit/icons/fill-duo/music-playlist";
import Queue from "@audio-kit/icons/fill-duo/queue";
import Slider from "@audio-kit/icons/fill-duo/slider";
import Sparkle from "@audio-kit/icons/fill-duo/sparkle";
import Speaker from "@audio-kit/icons/fill-duo/speaker";
import Stack from "@audio-kit/icons/fill-duo/stack";
import WaveformLines from "@audio-kit/icons/fill-duo/waveform-lines";
import Github from "@audio-kit/icons/social-media/github";
import XTwitter from "@audio-kit/icons/social-media/x-twitter";

type IconComponent = typeof WaveformLines;

interface IconEntry {
  icon: IconComponent;
  color: string;
  external?: boolean;
  tag?: string;
}

const iconMap: Record<string, IconEntry> = {
  "/": { icon: MapSearch, color: "var(--blue-9)" },
  "/getting-started": { icon: Download, color: "var(--green-9)" },
  "/getting-started/typescript": { icon: Code, color: "var(--blue-9)" },
  "/getting-started/react": { icon: Atom, color: "var(--cyan-9)" },

  "/concepts/sources": { icon: WaveformLines, color: "var(--purple-9)" },
  "/concepts/filters": { icon: Equalizer, color: "var(--orange-9)" },
  "/concepts/envelopes": { icon: Slider, color: "var(--pink-9)" },
  "/concepts/modulation": { icon: Dial, color: "var(--amber-9)" },
  "/concepts/layers": { icon: Layers, color: "var(--blue-9)" },
  "/concepts/effects": { icon: ConnectedDots, color: "var(--red-9)" },
  "/concepts/spatial": { icon: Headphones, color: "var(--teal-9)" },

  "/integrations/patches": {
    icon: Queue,
    color: "var(--violet-9)",
  },

  "/integrations/react": { icon: Code, color: "var(--cyan-9)" },
  "/integrations/react/provider": {
    icon: CircleWaveformLines,
    color: "var(--blue-9)",
  },
  "/integrations/react/use-sound": {
    icon: MusicNote,
    color: "var(--purple-9)",
  },
  "/integrations/react/use-pack": {
    icon: MusicPlaylist,
    color: "var(--violet-9)",
  },
  "/integrations/react/use-sequence": {
    icon: WaveformLines,
    color: "var(--pink-9)",
  },
  "/integrations/react/use-analyser": {
    icon: Equalizer,
    color: "var(--orange-9)",
  },
  "/integrations/react/use-listener": {
    icon: Headphones,
    color: "var(--teal-9)",
  },

  "/api/sounds": { icon: MusicNote, color: "var(--blue-9)" },
  "/api/sounds/define-sound": {
    icon: MusicNote,
    color: "var(--purple-9)",
  },
  "/api/sounds/define-sequence": {
    icon: WaveformLines,
    color: "var(--pink-9)",
  },
  "/api/sounds/shorthands": { icon: MediaPlay, color: "var(--green-9)" },

  "/api/patches": { icon: Stack, color: "var(--violet-9)" },
  "/api/patches/define-pack": {
    icon: MusicPlaylist,
    color: "var(--amber-9)",
  },
  "/api/patches/load-pack": { icon: Download, color: "var(--green-9)" },

  "/api/context": { icon: Dial, color: "var(--amber-9)" },
  "/api/context/get-context": {
    icon: CircleWaveformLines,
    color: "var(--blue-9)",
  },
  "/api/context/ensure-ready": {
    icon: MediaPlay,
    color: "var(--green-9)",
  },
  "/api/context/set-master-volume": {
    icon: Speaker,
    color: "var(--purple-9)",
  },
  "/api/context/set-listener": {
    icon: Headphones,
    color: "var(--teal-9)",
  },

  "/api/output": { icon: Speaker, color: "var(--green-9)" },
  "/api/output/create-master-analyser": {
    icon: Equalizer,
    color: "var(--orange-9)",
  },
  "/api/output/render-to-buffer": {
    icon: WaveformLines,
    color: "var(--pink-9)",
  },
  "/api/output/render-to-wav": {
    icon: MusicNote,
    color: "var(--purple-9)",
  },
  "/api/output/buffer-to-wav": {
    icon: MusicNote,
    color: "var(--amber-9)",
  },

  "/api/reference": { icon: ConnectedDots, color: "var(--gray-9)" },
  "/api/reference/types": { icon: ConnectedDots, color: "var(--red-9)" },

  "/resources/changelog": {
    icon: ClockRotateClockwise,
    color: "var(--orange-9)",
  },
  "/resources/llms": { icon: Sparkle, color: "var(--violet-9)" },
  "/resources/github": {
    icon: Github,
    color: "var(--gray-9)",
    external: true,
  },
  "/resources/twitter": {
    icon: XTwitter,
    color: "var(--gray-9)",
    external: true,
  },
  "/resources/npm": {
    icon: Download,
    color: "var(--red-9)",
    external: true,
    tag: "v0.0.6",
  },

  "/library": { icon: Music, color: "var(--violet-9)" },
};

export function getIconEntry(href: string): IconEntry | undefined {
  return iconMap[href];
}
