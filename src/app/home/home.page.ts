import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { delay, tap } from 'rxjs/operators';
import { TrackService } from '../services/track.service';
import { SpotifyService } from '../services/spotify.service';
import { TrackListService } from '../services/track-list.service';
import { concat } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  trackCollection = [];
  loading = false;
  trackAnalysed = 0;

  searchForm = this.formBuilder.group({
    artist: '',
    trackName: ''
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    readonly spotify: SpotifyService,
    private readonly trackService: TrackService,
    private readonly trackListService: TrackListService,
  ) {
  }

  onSubmit() {
    this.loading = true;

    const formValue = this.searchForm.value;

    this.trackService.analyzeTrack(formValue.trackName, formValue.artist).subscribe(track => {
      if (track) {
        this.trackCollection = [track];
      }

      this.loading = false;
    }, () => this.loading = false);
  }

  onFileChange(event) {
    const file = event.target.files[0];

    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.parseFile(fileReader.result.toString());
    };
    fileReader.readAsText(file);
  }

  private parseFile(fileAsText: string) {
    this.loading = true;
    this.trackCollection = [];

    this.trackAnalysed = 0;
    const trackList = this.trackListService.parse(fileAsText);

    console.log(trackList)

    concat(
      ...trackList.map(track =>
        this.trackService.analyzeTrack(track.name, track.artistName).pipe(
          delay(1000),
          tap(() => this.trackAnalysed++)
        )
      ),
    ).subscribe(track => {
      if (track) {
        this.trackCollection.push(track);
      }

      this.loading = this.trackAnalysed !== trackList.length;
    }, () => this.loading = false);

    // forkJoin(
    //   this.trackListService.parse(fileAsText).map(track =>
    //     this.trackService.fetchTrack(track.artistName, track.name)
    //   )
    // ).pipe(
    //   // map(resultArray => {
    //   //   // keep only first result
    //   //   resultArray = resultArray.map(result => [result[0]])

    //   //   // flatten the array
    //   //   return [].concat(...resultArray)
    //   // })
    // ).subscribe(trackCollection => {
    //   this.trackCollection = trackCollection;

    //   this.loading = false;
    // }, () => this.loading = false);
  }
}
