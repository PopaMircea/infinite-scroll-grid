import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map, Observable} from "rxjs";

const URL = 'https://api.unsplash.com/photos'
const HEADERS = {
  'Accept-Version': 'v1',
  Authorization: 'Client-ID B2I007KafH5AFVheAjd_r7Pmxy1dPmaYenbk11FWz0E'
}

@Injectable({
  providedIn: "root"
})
export class ImagesService {

  constructor(private httpClient: HttpClient) {
  }

  getImages(currentPage: number) {
    const pageRequest = {
      page: currentPage,
      per_page: 20,
    }
    return this.httpClient.get<Images[]>(`${URL}`, {params: {...pageRequest}, headers: HEADERS})
  }

  getImageBlob(url: string): Observable<Blob> {
    return this.httpClient.get(url, {responseType: 'arraybuffer', headers: HEADERS})
      .pipe(map(response => new Blob([response])));
  }
}

export interface Images {
  alt_description: string,
  blur_hash: string,
  breadcrumbs: any[],
  color: string,
  created_at: string,
  current_user_collections: any[]
  description: string,
  height: number,
  id: string
  liked_by_user: boolean,
  likes: number,
  links: { download: string, download_location: string, html: string, self: string },
  urls: { full: string, raw: string, regular: string, small: string, small_s3: string, thumb: string},
  width: number,
  loaded: boolean
}
