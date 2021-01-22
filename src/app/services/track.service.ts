import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Track } from '../models/track';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  constructor(
    private readonly http: HttpClient,
  ) { }

  analyzeTrack(
    name: string,
    artist: string,
  ): Observable<Track> {
    const url = `${environment.apiUrl}/analyze`;

    return this.http.post<Track>(url, {
      name,
      artist
    });
  }
}
