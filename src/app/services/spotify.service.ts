import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Track } from '../models/track';

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams(): {
  access_token?: string,
  expires_in?: number,
  state?: string
} {
  const hashParams = {};
  let e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

const STATE_KEY = 'spotify_auth_state';
const TOKEN_KEY = 'spotify_auth_token';
const EXPIRES_AT_KEY = 'spotify_auth_expires_at';

const SCOPE = 'user-read-private user-read-email';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private accessToken;

  constructor(
    private readonly http: HttpClient,
  ) {
    this.accessToken = this.readToken();

    this.init();
  }

  get isLogged() {
    return !!this.accessToken;
  }

  init() {
    const params = getHashParams();
    const access_token = params.access_token;
    const state = params.state;
    const storedState = localStorage.getItem(STATE_KEY);

    if (!access_token) {
      return;
    }

    if (state == null || state !== storedState) {
      console.error('There was an error during the authentication');
      return;
    }

    localStorage.removeItem(STATE_KEY);

    this.accessToken = access_token;

    this.storeToken(access_token, params.expires_in);
  }

  private storeToken(accessToken, expiresIn) {
    localStorage.setItem(TOKEN_KEY, accessToken);

    const expireAt = Date.now() + (expiresIn * 1000);
    localStorage.setItem(EXPIRES_AT_KEY, JSON.stringify(expireAt));
  }

  private readToken(): string {
    const accessToken = localStorage.getItem(TOKEN_KEY);

    // missing token
    if (!accessToken) {
      return;
    }

    const expireAt = localStorage.getItem(EXPIRES_AT_KEY);

    // token expired
    if (Date.now() >= +expireAt) {
      return;
    }

    return accessToken;
  }

  /**
   *
   */
  login() {
    const state = generateRandomString(16);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);

    localStorage.setItem(STATE_KEY, state);

    const url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent(environment.spotify.clientId)}&scope=${encodeURIComponent(SCOPE)}&redirect_uri=${encodeURIComponent(environment.spotify.redirectUri)}&state=${encodeURIComponent(state)}`;

    window.location.assign(url);
  }

  /**
   *
   */
  searchTrack(artist: string, name: string): Observable<Track[]> {
    const url = `https://api.spotify.com/v1/search?q=artist:${artist}%20track:${name}&type=track`;

    return this.http.get(url,
    {
      headers: {
        Authorization: 'Bearer ' + this.accessToken
      }
    }).pipe(
      map((response: any) => {
        return response.tracks.items.map(track => {
          return {
            name: track.name,
            artistName: track.artists.map(el => el.name).join(', '),
            genre: {},
            albumName: track.album.name,
            coverUrl: track.images[0].url
          };
        });
      })
    );
  }

  searchArtist(artistName: string): Observable<any[]> {
    const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist`;

    return this.http.get(url,
    {
      headers: {
        Authorization: 'Bearer ' + this.accessToken
      }
    }).pipe(
      map((response: any) => {
        return response.artists.items.map(artist => {
          return {
            ...artist,
            genresString: artist.genres.join(', ')
          };
        });
      }),
    )
  }
}
