import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { map, mergeMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams(): {
  access_token?: string,
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
const SCOPE = 'user-read-private user-read-email';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private accessToken = undefined;

  trackCollection = [];

  searchForm = this.formBuilder.group({
    artist: '',
    trackName: ''
  });

  constructor(
    private readonly http: HttpClient,
    private readonly formBuilder: FormBuilder,
  ) {
    this.init();
  }

  get isLogged() {
    return !!this.accessToken;
  }

  private init() {
    const params = getHashParams();
    const access_token = params.access_token;
    const state = params.state;
    const storedState = localStorage.getItem(STATE_KEY);

    this.accessToken = undefined;

    if (!access_token) {
      return;
    }

    if (state == null || state !== storedState) {
      console.error('There was an error during the authentication');
      return;
    }

    localStorage.removeItem(STATE_KEY);

    this.accessToken = access_token;
  }

  /**
   *
   */
  login() {
    const state = generateRandomString(16);

    localStorage.setItem(STATE_KEY, state);

    const url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent(environment.spotify.clientId)}&scope=${encodeURIComponent(SCOPE)}&redirect_uri=${encodeURIComponent(environment.spotify.redirectUri)}&state=${encodeURIComponent(state)}`;

    window.location.assign(url);
  }

  /**
   *
   */
  searchTrack(artist: string, name: string) {
    const url = `https://api.spotify.com/v1/search?q=artist:${artist}%20track:${name}&type=track`;

    this.http.get(url,
    {
      headers: {
        Authorization: 'Bearer ' + this.accessToken
      }
    }).pipe(
      map((response: any) => {
        return response.tracks.items.map(track => {
          return {
            ...track,
            artistsString: track.artists.map(el => el.name).join(', ')
          };
        });
      }),
      mergeMap((trackCollection) => {
        return forkJoin(trackCollection.map(track => {
          const artistIds = track.artists.map(el => el.id).join(',');

          return this.http.get(
            `https://api.spotify.com/v1/artists?ids=${artistIds}`,
            {
              headers: {
                Authorization: 'Bearer ' + this.accessToken
              }
            }
          ).pipe(
            map((artistsResponse: any) => {
              return {
                ...track,
                artists: artistsResponse.artists,
                genresString: artistsResponse.artists.map(el => el.genres.join(', ')).join(' - ')
              }
            })
          )
        }))
      })
    ).subscribe(trackCollection => {
      this.trackCollection = trackCollection;
    });
  }

  searchArtist(artistName: string) {
    const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist`;

    this.http.get(url,
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
    ).subscribe(trackCollection => {
      this.trackCollection = trackCollection;
    });
  }

  onSubmit() {
    const formValue = this.searchForm.value;

    // this.searchTrack(formValue.artist, formValue.trackName);
    this.searchArtist(formValue.artist);
  }
}
