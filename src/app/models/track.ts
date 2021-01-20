export class Track {
  name: string;
  artistName: string;
  albumName?: string;
  coverUrl?: string;
  genre?: {
    spotify?: string
    itunes?: string
  } = {};
}
