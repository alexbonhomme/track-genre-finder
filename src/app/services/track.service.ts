import { Injectable } from '@angular/core';
import { forkJoin, of, Observable, merge } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
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
      mergeMap(trackCollection => {
        // if not found on itunes, fetch from spotify
        if (trackCollection.length === 0) {
          return this.spotifyService.searchTrack(artist, name);
        }

        return of(trackCollection);
      }),
      mergeMap(trackCollection => {
        if (trackCollection.length === 0) {
          return of(undefined);
        }

        // get the first one only to not kill spotify API
        const track = trackCollection[0];

        // return forkJoin(
        //   trackCollection.map(track =>
        //     this.fetchGenresFromSpotify(track.artistName).pipe(
        //       map(genres => {
        //         track.genre.spotify = genres;

        //         return track;
        //       })
        //     )
        //   )
        // );

        return this.fetchGenresFromSpotify(track.artistName).pipe(
            map(genres => {
              track.genre.spotify = genres;

              return track;
            })
          );
        }
      ),
      // removes track not found
      // filter(track => !!track)
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
