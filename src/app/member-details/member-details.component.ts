import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControlName } from '@angular/forms';
import { AppService } from '../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable, fromEvent, merge } from 'rxjs';
import { GenericValidator } from '../shared/generic-validator';
import { debounceTime } from 'rxjs/operators';

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  teamId: number;
  status: string;
}

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  memberModel: Member;
  memberForm: FormGroup;
  submitted = false;
  alertType: String;
  alertMessage: String;
  teams = [];
  pageTitle = 'Add Member to Racing Team';
  errorMessage: string;
  private sub: Subscription;

  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private fb: FormBuilder,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router) {
    // NOTE: BONUS Acceptance Criteria - The member detail form should have client-side validation
    this.validationMessages = {
      firstName: {
        required: 'First name is required.',
        minlength: 'First name must be at least three characters.',
        maxlength: 'First name cannot exceed 50 characters.'
      },
      lastName: {
        required: 'Last name is required.',
        minlength: 'Last name must be at least three characters.',
        maxlength: 'Last name cannot exceed 50 characters.'
      },
      jobTitle: {
        required: 'Job Title is required.',
        minlength: 'Job Title must be at least three characters.',
        maxlength: 'Job Title cannot exceed 50 characters.'
      },
      teamId: {
        required: 'Team Name is required.'
      }
    };

    // Define an instance of the validator for use with this form,
    // passing in this form's set of validation messages.
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.appService.getTeams().subscribe(teams => (this.teams = teams));

    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)]],
      lastName: ['', [Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)]],
      jobTitle: ['', [Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)]],
      teamId: ['', Validators.required],
      status: ['']
    });

    // Read the Id from the route parameter
    this.sub = this.route.paramMap.subscribe(
      params => {
        const id = +params.get('id');
        if (id === 0) {
          this.displayMember({
            id: 0,
            firstName: '',
            lastName: '',
            jobTitle: '',
            teamId: null,
            status: 'Active'
          });
        } else {
          this.getMember(id);
        }
      }
    );
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.memberForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.memberForm);
    });
  }

  getMember(id: number): void {
    this.appService.getMember(id)
      .subscribe({
        next: (member: Member) => this.displayMember(member),
        error: err => this.errorMessage = err
      });
  }

  displayMember(member: Member): void {
    if (this.memberForm) {
      this.memberForm.reset();
    }
    this.memberModel = member;

    if (this.memberModel.id === 0) {
      this.pageTitle = 'Add Member to Racing Team';
    } else {
      this.pageTitle = `Edit Member: ${this.memberModel.firstName} ${this.memberModel.lastName}`;
    }

    // Update the data on the form
    this.memberForm.patchValue({
      firstName: this.memberModel.firstName,
      lastName: this.memberModel.lastName,
      jobTitle: this.memberModel.jobTitle,
      teamId: this.memberModel.teamId,
      status: this.memberModel.status
    });
  }

  saveMember(): void {
    if (this.memberForm.valid) {
      if (this.memberForm.dirty) {
        const member = { ...this.memberModel, ...this.memberForm.value };
        if (member.id === 0) {
          this.appService.addMember(member)
            .subscribe({
              next: () => this.onSaveComplete(),
              error: err => this.errorMessage = err
            });
        } else {
          this.appService.editMember(member.id, member)
            .subscribe({
              next: () => this.onSaveComplete(),
              error: err => this.errorMessage = err
            });
        }
      } else {
        this.onSaveComplete();
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onSaveComplete(): void {
    // Reset the form to clear the flags
    this.memberForm.reset();
    this.router.navigate(['members']);
  }

  redirectToPrevious() {
    this.router.navigate(['members']);
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
