import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";

import { MessageService } from './message.service';
import { Hero } from './hero';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = 'api/heroes';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private spinner: NgxSpinnerService
  ) { }

  getHeroes(): Observable<Hero[]> {
    return this.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }

  getHero(id: number): Observable<Hero>{
    const url = `${this.heroesUrl}/${id}`;
    return this.get<Hero>(url)
      .pipe(
        tap(_ => this.log(`fetched hero id=${id}`)),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  updateHero(hero: Hero): Observable<any>{
    return this.put(this.heroesUrl, hero)
      .pipe(
        tap(_ => this.log(`updated hero id=${hero.id}`)),
        catchError(this.handleError<any>('updateHero'))
      );
  }

  addHero(hero: Hero): Observable<Hero>{
    return this.post<Hero>(this.heroesUrl, hero)
      .pipe(
        tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
        catchError(this.handleError<Hero>('addHero'))
      );
  }

  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.delete<Hero>(url)
      .pipe(
        tap(_ => this.log(`deleted hero id=${id}`)),
        catchError(this.handleError<Hero>('deleteHero'))
      );
  }

  searchHeroes(term: string): Observable<Hero[]>{
    if (!term.trim()){ return of([])}

    const url = `${this.heroesUrl}/?name=${term}`;

    return this.get<Hero[]>(url)
      .pipe(
        tap(_ => this.log(`found heroes matching "${term}"`)),
        catchError(this.handleError<Hero[]>('searchHeroes', []))
      );
  }

  private get<T>(url: string): Observable<any>{
    this.spinner.show();
    return this.http.get<T>(url)
      .pipe(
        tap(_ => this.spinner.hide())
      );
  }

  private delete<T>(url: string): Observable<any>{
    this.spinner.show();
    return this.http.delete<T>(url, this.httpOptions)
      .pipe(
        tap(_ => this.spinner.hide())
      );
  }

  private post<T>(url: string, params: any): Observable<any>{
    this.spinner.show();
    return this.http.post<T>(url, params, this.httpOptions)
      .pipe(
        tap(_ => this.spinner.hide())
      );
  }

  private put<T>(url: string, params: any): Observable<any>{
    this.spinner.show();
    return this.http.put<T>(url, params, this.httpOptions)
      .pipe(
        tap(_ => this.spinner.hide())
      );
  }

  private log(message: string){
    this.messageService.add(`HeroService: ${message}`);
  }

  private handleError<T> (operation = 'operation', result?: T){
    return (error: any): Observable<T> => {
      //TODO: send the error to remote logging infrastructure
      console.error(error);
      
      //TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    }
  }

}
