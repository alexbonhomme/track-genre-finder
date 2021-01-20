import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { map, mergeMap } from 'rxjs/operators';
import { TrackService } from '../services/track.service';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  trackCollection = [];

  searchForm = this.formBuilder.group({
    artist: '',
    trackName: ''
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly spotify: SpotifyService,
    private readonly trackService: TrackService,
  ) {

  }

  onSubmit() {
    const formValue = this.searchForm.value;

    // this.searchTrack(formValue.artist, formValue.trackName);
    // this.searchTrackItunes(formValue.artist, formValue.trackName);
    // this.searchArtist(formValue.artist);

    this.trackService.fetchTrack(formValue.artist, formValue.trackName).subscribe(trackCollection => {
      this.trackCollection = trackCollection;
    });;
  }
}
