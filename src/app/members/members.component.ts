import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {
  members = [];
  teams = [];

  constructor(public appService: AppService) { }

  ngOnInit() {
    const teamsObservable = this.appService.getTeams();
    const membersObservable = this.appService.getMembers();
    forkJoin([teamsObservable, membersObservable]).subscribe(response => {
      this.teams = response[0];
      this.members = response[1];
    });
  }

  delete(id: number) {
    this.appService.deleteMember(id).subscribe(() => {
      this.appService.getMembers().subscribe(members => (this.members = members));
    });
  }

  getTeamName(id: number) {
    if (id) {
      const foundTeam = this.teams.find(t => t.id == id);
      return foundTeam.teamName;
    }
  }
}
