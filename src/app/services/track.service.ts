import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Track } from '../models/track';
import { ItunesService } from './itunes.service';
import { SpotifyService } from './spotify.service';

@Injectable({
  providedIn: 'root'
})
export class TrackService {

  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly itunesService: ItunesService
  ) { }

  fetchTrack(
    artist: string,
    name: string
  ): Observable<Track> {
    return this.itunesService.searchTrack(artist, name).pipe(
      map(trackCollection => trackCollection[0])
    );
  }
}
