// Sample horizontal videos (Pexels, freely usable) used as placeholders until
// a real video backend (Cloudinary / Shotstack / FFmpeg) is wired up.
export interface SampleVideo {
  id: string;
  title: string;
  thumbnail: string;
  src: string;
  duration: string;
}

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: "v1",
    title: "Entrevista en estudio",
    thumbnail:
      "https://images.pexels.com/videos/3209828/free-video-3209828.jpg?auto=compress&cs=tinysrgb&w=800",
    src: "https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4",
    duration: "0:12",
  },
  {
    id: "v2",
    title: "Podcast — episodio 14",
    thumbnail:
      "https://images.pexels.com/videos/7989676/pexels-photo-7989676.jpeg?auto=compress&cs=tinysrgb&w=800",
    src: "https://videos.pexels.com/video-files/7989676/7989676-hd_1920_1080_25fps.mp4",
    duration: "0:18",
  },
  {
    id: "v3",
    title: "Noticia de actualidad",
    thumbnail:
      "https://images.pexels.com/videos/5377700/pexels-photo-5377700.jpeg?auto=compress&cs=tinysrgb&w=800",
    src: "https://videos.pexels.com/video-files/5377700/5377700-hd_1920_1080_25fps.mp4",
    duration: "0:22",
  },
];
