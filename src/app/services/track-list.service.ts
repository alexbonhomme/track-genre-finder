import { Injectable } from '@angular/core';
import { StringDecoder } from 'string_decoder';
import { Track } from '../models/track';


const FILE_STRING = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
    <NML VERSION="19"><HEAD COMPANY="www.native-instruments.com" PROGRAM="Traktor"></HEAD>
    <MUSICFOLDERS></MUSICFOLDERS>
    <COLLECTION ENTRIES="2"><ENTRY MODIFIED_DATE="2020/7/25" MODIFIED_TIME="68536" AUDIO_ID="AQwlVURFVVVFVURVVEREVERWvJeWRoZ4Zka5d2VnuHVVR6Z7ybu3i7m7p4u53Libuu24nqvep42r3Jieu7yYra3f/v////7////+/////v/v//7//////////////+//77d3iFZ4hndUZ4eHRXh3iHZlRVVEVUVVRVVFVVVVVVaHmpmYe6mJmZqamYdnmImZqpqqqJqqqZq6qquXiqu6dmiZmYZoiJqau6mZZ4iZqZmnVVVVVUREZ2QzMzRDMyNX/+/+///v/v//7////+/+///v/////////////////v+Zn6/+dXlZzIaKeryEaXmVVVREU0QxEjMiIREhAAAAAA==" TITLE="Build Your Castles" ARTIST="Shkoon"><LOCATION DIR="/:Users/:alex/:Music/:data/:_from YouTube/:" FILE="Shkoon - Build Your Castles (Official Music Video) - Underyourskin Records.m4a" VOLUME="Macintosh HD" VOLUMEID="Macintosh HD"></LOCATION>
    <MODIFICATION_INFO AUTHOR_TYPE="user"></MODIFICATION_INFO>
    <INFO BITRATE="2822400" COMMENT="from YouTube" COVERARTID="109/N1NZKQA5N3TGZCJL1JO4CWAU13SA" KEY="4m" PLAYCOUNT="2" PLAYTIME="269" PLAYTIME_FLOAT="268.208984" IMPORT_DATE="2021/1/20" LAST_PLAYED="2020/11/18" FLAGS="12"></INFO>
    <TEMPO BPM="114.998528" BPM_QUALITY="100.000000"></TEMPO>
    <LOUDNESS PEAK_DB="-0.225504" PERCEIVED_DB="1.777008" ANALYZED_DB="1.777008"></LOUDNESS>
    <MUSICAL_KEY VALUE="18"></MUSICAL_KEY>
    <CUE_V2 NAME="AutoGrid" DISPL_ORDER="0" TYPE="4" START="51.639318" LEN="0.000000" REPEATS="-1" HOTCUE="0"></CUE_V2>
    </ENTRY>
    <ENTRY MODIFIED_DATE="2020/10/29" MODIFIED_TIME="65093" AUDIO_ID="AZUTRDREVEU1U0NGRENUNURTREVDVUVYrNzsrN3pzc68ze2t3OvMzsvd3b3exmd2dndnd3Znd2aqypqruqu9yrvcu+3c7c3u3O7t7dzu3t7c3+3u7O7d3tzf7e7s7t7e3M/u7uze3e7u7s7t3e7u3O3e7u7s3u3u7u7e7t7+zP/v/9+3h3iIeIh3h4iImpiIiJiJmpmYqZmZVDM0REOt7d7c3ezO7t7t3t3e7c3u3t3e3d7tzu7e7t7t7u3N/sh4h3eIet3u7M7u3e793f7d3u/c7+3d7u3O7t///////9387s7d/O/O3fzvzuz8787s/N7O7Ozevuzt3r7r7d+7EA==" TITLE="Erotic Polymorphic Experience (Brioski Remix)" ARTIST="Theus Mago"><LOCATION DIR="/:Users/:alex/:Music/:data/:_from YouTube/:" FILE="Theus Mago · Theus Mago - Erotic Polymorphic Experience (Brioski Remix).m4a" VOLUME="Macintosh HD" VOLUMEID="Macintosh HD"></LOCATION>
    <ALBUM TITLE="Erotic Polymorphic Experience"></ALBUM>
    <MODIFICATION_INFO AUTHOR_TYPE="user"></MODIFICATION_INFO>
    <INFO BITRATE="2822400" GENRE="Electro" COMMENT="from YouTube" COVERARTID="088/YSRJTNDVHHYXSC4BOJUKBP4DTUPD" KEY="11m" PLAYCOUNT="10" PLAYTIME="406" PLAYTIME_FLOAT="405.006989" IMPORT_DATE="2021/1/20" LAST_PLAYED="2020/11/25" RELEASE_DATE="2019/1/1" FLAGS="12"></INFO>
    <TEMPO BPM="112.000320" BPM_QUALITY="100.000000"></TEMPO>
    <LOUDNESS PEAK_DB="-0.328742" PERCEIVED_DB="1.964172" ANALYZED_DB="1.964172"></LOUDNESS>
    <MUSICAL_KEY VALUE="19"></MUSICAL_KEY>
    <CUE_V2 NAME="AutoGrid" DISPL_ORDER="0" TYPE="4" START="154.921040" LEN="0.000000" REPEATS="-1" HOTCUE="0"></CUE_V2>
    <CUE_V2 NAME="n.n." DISPL_ORDER="0" TYPE="5" START="311939.743302" LEN="8571.404048" REPEATS="-1" HOTCUE="1"></CUE_V2>
    </ENTRY>
    </COLLECTION>
    <SETS ENTRIES="0"></SETS>
    <PLAYLISTS><NODE TYPE="FOLDER" NAME="$ROOT"><SUBNODES COUNT="1"><NODE TYPE="FOLDER" NAME="ALESK"><SUBNODES COUNT="1"><NODE TYPE="PLAYLIST" NAME="test"><PLAYLIST ENTRIES="2" TYPE="LIST" UUID="415674c061b5417482c1639f77f515c6"><ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Users/:alex/:Music/:data/:_from YouTube/:Theus Mago · Theus Mago - Erotic Polymorphic Experience (Brioski Remix).m4a"></PRIMARYKEY>
    </ENTRY>
    <ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Users/:alex/:Music/:data/:_from YouTube/:Shkoon - Build Your Castles (Official Music Video) - Underyourskin Records.m4a"></PRIMARYKEY>
    </ENTRY>
    </PLAYLIST>
    </NODE>
    </SUBNODES>
    </NODE>
    </SUBNODES>
    </NODE>
    </PLAYLISTS>
    <INDEXING></INDEXING>
    </NML>
    `;


@Injectable({
  providedIn: 'root'
})
export class TrackListService {

  constructor() { }

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
