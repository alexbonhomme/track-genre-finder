import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Track } from '../models/track';

@Injectable({
  providedIn: 'root'
})
export class ItunesService {

  constructor(
    private readonly http: HttpClient,
  ) { }

  searchTrack(
    artist: string,
    name: string
  ): Observable<Track[]> {
    const query = `${artist} ${name}`.replace(/ /g, '+');
    const url = `https://itunes.apple.com/search?entity=song&term=${encodeURI(query)}`;

    return this.http.get<Track[]>(url).pipe(
      map((response: any) => {
        return response.results.map(song => {
          return {
            name: song.trackName,
            artistName: song.artistName,
            genre: {
              itunes: song.primaryGenreName,
            },
            albumName: song.collectionName,
            coverUrl: song.artworkUrl100
          };
        });
      }),
    );
  }
}
