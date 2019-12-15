import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberDetailsComponent } from './member-details.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../app.service';
import { of, BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { MembersComponent } from '../members/members.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MemberDetailsComponent', () => {
  let fixture: ComponentFixture<MemberDetailsComponent>;
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

  const member = {
    id: 3,
    firstName: 'Chris',
    lastName: 'Koch',
    jobTitle: 'Angular Dev',
    teamId: 1,
    status: 'Active'
  };


  beforeEach(async(() => {
    mockAppService = jasmine.createSpyObj(['getTeams', 'getMember', 'addMember', 'editMember']);

    TestBed.configureTestingModule({
      declarations: [MemberDetailsComponent, MembersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule.withRoutes([{ path: 'members', component: MembersComponent }])
      ],
      providers: [
        { provide: AppService, useValue: mockAppService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: new BehaviorSubject(
              convertToParamMap({
                id: 3
              })
            )
          }
        },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberDetailsComponent);

    mockAppService.getTeams.and.returnValue(of(teams));
    mockAppService.getMember.and.returnValue(of(member));

    fixture.detectChanges();
  });

  it('should have the correct member', () => {
    fixture.componentInstance.memberModel = member;

    expect(fixture.componentInstance.memberModel.firstName).toEqual('Chris');
  });

  it('should render the member first name in an input element', async(() => {
    fixture.whenStable().then(() => {
      const de = fixture.debugElement.query(By.css('input[id="firstNameId"]'));
      expect(de.nativeElement.value).toEqual('Chris');
    });
  }));
});
