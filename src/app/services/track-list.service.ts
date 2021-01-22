import { Injectable } from '@angular/core';
import { Track } from '../models/track';

@Injectable({
  providedIn: 'root'
})
export class TrackListService {
  /**
   *
   */
  parse(fileAsText: string): Track[] {
    const parser = new DOMParser();
    const tracklistDocument = parser.parseFromString(fileAsText, 'text/xml');

    const trackCollectionElement = tracklistDocument.getElementsByTagName('COLLECTION')[0].getElementsByTagName('ENTRY');

    const trackCollection = [];
    for (let i = 0; i < trackCollectionElement.length; i++) {
      const element = trackCollectionElement[i];

      trackCollection.push({
        name: element.getAttribute('TITLE'),
        artistName: element.getAttribute('ARTIST')
      });
    }

    return trackCollection;
  }
}
