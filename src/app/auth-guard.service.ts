import { AppService } from './app.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {


  constructor(private _appService: AppService, private _router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // NOTE: BONUS Acceptance Criteria - I should not be able to navigate to members page without being logged on
    if (this._appService.isAuthenticated()) {
      return true;
    }

    // navigate to login page
    this._router.navigate(['login']);
    return false;
  }
}
