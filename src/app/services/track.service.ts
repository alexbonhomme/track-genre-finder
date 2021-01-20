import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
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
  ): Observable<Track[]> {
    return this.itunesService.searchTrack(artist, name).pipe(
      mergeMap(trackCollection =>
        forkJoin(
          trackCollection.map(track =>
            this.fetchGenresFromSpotify(track.artistName).pipe(
              map(genres => {
                track.genre.spotify = genres;

                return track;
              })
            )
          )
        )
      ),
    );
  }

  private fetchGenresFromSpotify(artistName: string): Observable<string> {
    return this.spotifyService.searchArtist(artistName).pipe(
      map((spotifyArtist: any) => {
        return spotifyArtist[0].genres.join(', ');
      })
    );
  }
}
