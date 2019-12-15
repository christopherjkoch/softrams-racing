import { async, ComponentFixture, TestBed, fakeAsync, flush, discardPeriodicTasks } from '@angular/core/testing';
import { MemberDetailsComponent } from './member-details.component';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../app.service';
import { of, BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { MembersComponent } from '../members/members.component';
import { By } from '@angular/platform-browser';

describe('MemberDetailsComponent', () => {
  let component: MemberDetailsComponent;
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

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  function updateForm(firstName, lastName) {
    component.memberForm.controls['firstName'].setValue(firstName);
    component.memberForm.controls['lastName'].setValue(lastName);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is valid after init', () => {
    // Validate form is valid after initialization
    expect(component.memberForm.valid).toBeTruthy();
  });

  it('firstName should be invalid when empty', () => {
    // Validate first name required is working correctly
    updateForm('', 'Koch');
    let errors = {};
    const firstName = component.memberForm.controls['firstName'];
    errors = firstName.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('firstName should be invalid when length is less than min length', () => {
    // Validate first name min length is working correctly
    updateForm('C', 'Koch');
    const firstName = component.memberForm.controls['firstName'];
    expect(firstName.valid).toBeFalsy();
  });

  it('should call editMember when saveMember is called', fakeAsync(() => {
    mockAppService.editMember.and.returnValue(of({}));

    fixture.detectChanges();
    const inputDe = fixture.debugElement.query(By.css('input[id="firstNameId"]'));
    const inputEl = inputDe.nativeElement;
    inputEl.value = 'Christopher';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.componentInstance.saveMember();
    flush();

    expect(mockAppService.editMember).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should call addMember when saveMember is called', fakeAsync(() => {
    mockAppService.addMember.and.returnValue(of({}));

    fixture.detectChanges();
    fixture.componentInstance.memberModel.id = 0;

    component.memberForm.controls['firstName'].setValue('Magic');
    component.memberForm.controls['lastName'].setValue('Johnson');
    component.memberForm.controls['jobTitle'].setValue('NBA Owner');
    component.memberForm.controls['teamId'].setValue(1);
    component.memberForm.controls['status'].setValue('Active');

    fixture.detectChanges();
    const inputDe = fixture.debugElement.query(By.css('input[id="firstNameId"]'));
    const inputEl = inputDe.nativeElement;
    inputEl.value = 'Irvin';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.componentInstance.saveMember();
    flush();

    expect(mockAppService.addMember).toHaveBeenCalled();
    discardPeriodicTasks();
  }));
});
