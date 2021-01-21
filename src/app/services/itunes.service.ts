import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
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
    const url = `${environment.apiUrl}/itunes/search`;

    return this.http.post<Track[]>(url, {
      name,
      artist
    });
  }
}
