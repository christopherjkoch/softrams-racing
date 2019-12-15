import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MembersComponent } from './members.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MemberDetailsComponent } from '../member-details/member-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../app.service';
import { of } from 'rxjs';

describe('MembersComponent', () => {
  let component: MembersComponent;
  let fixture: ComponentFixture<MembersComponent>;
  let mockAppService;

  const teams = [
    {
      'id': 1,
      'teamName': 'Formula 1 - Car 77'
    },
    {
      'id': 2,
      'teamName': 'Formula 1 - Car 8'
    },
    {
      'id': 3,
      'teamName': 'Formula 2 - Car 54'
    }
  ];

  const members =  [
    {
      'id': 1,
      'firstName': 'John',
      'lastName': 'Doe',
      'jobTitle': 'Driver',
      'teamId': 1,
      'status': 'Active'
    },
    {
      'id': 2,
      'firstName': 'Alex',
      'lastName': 'Sainz',
      'jobTitle': 'Driver',
      'teamId': 2,
      'status': 'Active'
    },
    {
      'id': 3,
      'firstName': 'Jeb',
      'lastName': 'Jackson',
      'jobTitle': 'Reserve Driver',
      'teamId': 3,
      'status': 'Inactive'
    }
  ];


  beforeEach(async(() => {
    mockAppService = jasmine.createSpyObj(['getTeams', 'getMembers', 'deleteMember']);

    TestBed.configureTestingModule({
      declarations: [MembersComponent, MemberDetailsComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule.withRoutes([{ path: 'members/:id', component: MemberDetailsComponent }])
      ],
      providers: [
        { provide: AppService, useValue: mockAppService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersComponent);

    mockAppService.getTeams.and.returnValue(of(teams));
    mockAppService.getMembers.and.returnValue(of(members));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('delete', () => {

    it('should remove the indicated member from the members list', () => {
      mockAppService.deleteMember.and.returnValue(of(true));
      component.members = members;

      component.delete(members[2].id);

      expect(component.members.length).toBe(3);
    });

    it('should call deleteMember', () => {
      mockAppService.deleteMember.and.returnValue(of(true));
      component.members = members;

      component.delete(members[2].id);
      expect(mockAppService.deleteMember).toHaveBeenCalledWith(members[2].id);
    });
  });
});
