import { PatientFormDialogComponent } from './patient-form/patient-form-dialog/patient-form-dialog.component';
import { Component, Injector, ChangeDetectorRef, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";
import {
  PatientDto,
  PatientServiceProxy,
} from "./../../shared/service-proxies/service-proxies";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@angular/common";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
class PagedPatientRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [SharedModule,CommonModule,NgChartsModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css',
  animations: [appModuleAnimation()],
})
export class PatientComponent extends PagedListingComponentBase<PatientDto>implements OnInit{
  patients: PatientDto[] = [];
  isActive: boolean | null = null;
  keyword = "";
  advancedFiltersVisible = false;
  sorting = "name asc";
  activeTab: 'dashboard' | 'list' = 'list';
 public genderChartLabels: string[] = ["Male", "Female", "Other"];
public genderChartData = {
  labels: ["Male", "Female", "Other"],
  datasets: [
    {
      label: 'Gender Distribution',
      data: [0, 0, 0],
      backgroundColor: ["#4E79A7", "#A0CBE8", "#F28E2B"]
    }
  ]
};
public genderChartType: string = 'pie';
  public genderChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  public diseaseChartLabels: string[] = ["Abc", "Fever", "Cold"];
  public diseaseChartData={
  
  //   { data: [0, 0, 0], backgroundColor: ["#4E79A7", "#A0CBE8", "#F28E2B"] },
    labels: ["Abc", "Fever", "Cold"],
  datasets: [
    {
      label: 'Disease Distribution',
      data: [0, 0, 0],
      backgroundColor: ["#4E79A7", "#A0CBE8", "#F28E2B"]
    }
  ]
}
public diseaseChartType: string= "bar";
  public diseaseChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  constructor(
    injector: Injector,
    private _patientService: PatientServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  exportToExcel(): void {
  const worksheet = XLSX.utils.json_to_sheet(this.patients.map(p => ({
    Name: p.name,
    Age: p.age,
    Gender: this.getGenderString(p.gender),
    PhoneNumber:p.phoneNumber,
    Disease: p.disease,
    Doctor:p.doctor
   
   
  })));
 
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
 
  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });
 
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
 
  FileSaver.saveAs(blob, `Patient_List_${new Date().getTime()}.xlsx`);
}
  ngOnInit(): void {
    this.getDataPage(1);
    this.updateChart();
  }
  openPatientForm(patient?: PatientDto): void {
    const dialog = this._modalService.show(PatientFormDialogComponent, {
      class: "modal-lg",
      initialState: {
        patient: patient ? Object.assign({}, patient) : null,
      },
    });

    (dialog.content as PatientFormDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
  }

  createPatient(): void {
    this.openPatientForm();
  }

  editPatient(patient: PatientDto): void {
    this.openPatientForm(patient);
  }

  changeSorting(field: string): void {
    const isAsc = this.sorting === `${field} asc`;
    this.sorting = isAsc ? `${field} desc` : `${field} asc`;
    this.refresh();
  }

  clearFilters(): void {
    this.keyword = "";
    this.getDataPage(1);
  }

  protected list(
    request: PagedPatientRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._patientService
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.patients = result.items;
        this.updateChart();
        this.showPaging(result, pageNumber);
        this.cd.detectChanges();
      });
  }

  protected delete(patient: PatientDto): void {
    abp.message.confirm(
      this.l("Delete Warning Message", patient.id),
      undefined,
      (result: boolean) => {
        if (result) {
          this._patientService.delete(patient.id).subscribe(() => {
            abp.notify.success(this.l("SuccessfullyDeleted"));
            this.getDataPage(1);
          });
        }
      }
    );
  }
updateChart(): void {
  this._patientService.getAllChart(
    undefined,
    undefined,
    undefined,
    undefined
  ).subscribe((result) => {
    const genderCounts = { male: 0, female: 0, other: 0 };
    // const diseaseCounts = { abc: 0, fever: 0, cold: 0 };
    result.forEach((g) => {
      const gender = g.gender.toLowerCase();
      if (gender === "male") genderCounts.male = g.count;
      else if (gender === "female") genderCounts.female = g.count;
      else genderCounts.other = g.count;
    });
    // result.forEach((d)=>{
    // if (d.disease?.toLowerCase() === 'abc') diseaseCounts.abc++;
    // else if (d.disease?.toLowerCase() === 'fever') diseaseCounts.fever++;
    // else if (d.disease?.toLowerCase() === 'cold') diseaseCounts.cold++;
    // })

    this.genderChartData = {
      labels: ["Male", "Female", "Other"],
      datasets: [
        {
          label: 'Gender Distribution',
          data: [
            genderCounts.male,
            genderCounts.female,
            genderCounts.other,
          ],
          backgroundColor: ["#4E79A7", "#A0CBE8", "#F28E2B"]
        }
      ]
    };
    //     this.diseaseChartData = {
    //   labels: ["Abc", "Fever", "Cold"],
    //   datasets: [
    //     {
    //       label: 'Disease Distribution',
    //       data: [
    //         diseaseCounts.abc,
    //         diseaseCounts.fever,
    //         diseaseCounts.cold,
    //       ],
    //       backgroundColor: ["#4E79A7", "#A0CBE8", "#F28E2B"]
    //     }
    //   ]
    // };

    this.cd.detectChanges();
  });
}

 

  getGenderString(gender: number): string {
    switch (gender) {
      case 0:
        return "Male";
      case 1:
        return "Female";
      case 2:
        return "Other";
      default:
        return "Unknown";
    }
  }
}
