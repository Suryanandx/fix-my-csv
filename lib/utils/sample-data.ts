// Enhanced sample data with more numeric columns and formulas
export const sampleCsvData = `Name,Date of Birth,Email,Phone Number,Annual Income,Monthly Expenses,Savings Rate,Credit Score,Last Purchase,Status,Age,Account Balance,Investment Returns,Yearly Expenses
John Smith,1/15/1985,john.smith@example.com,(555) 123-4567,$75000.00,$2500.00,15%,720,2023-01-15,Active,38,$45000.25,$3750.00,$30000.00
Jane Doe,02/28/1990,jane.doe@example.com,555.987.6543,$82500.00,$3100.00,22%,745,01/30/2023,Active,33,$62150.75,$4125.00,$37200.00
Michael Johnson,3-17-1978,michael.j@example,5551234567,$65000,$2200.00,12%,680,2023/02/15,Inactive,45,$28750.50,$3250.00,$26400.00
Emily Williams,,emily@example.com,(555)456-7890,$92000.50,$3800.00,25%,790,,Active,30,$78500.00,$4600.00,$45600.00
David Brown,05/05/1982,david.brown@example.com,555 789 0123,$67500,$2400.00,18%,705,2023-03-01,Active,41,$41250.25,$3375.00,$28800.00
Sarah Miller,6.12.1995,sarah.miller@example.com,+1 555 234 5678,$72000.75,$2650.00,20%,735,03/15/2023,Active,28,$53600.50,$3600.00,$31800.00
Robert Wilson,1977-07-22,robert@example.com,(555) 345-6789,$58000.25,$1950.00,10%,660,2023-04-01,Inactive,46,$22750.00,$2900.00,$23400.00
Jennifer Taylor,08/30/1988,jennifer.t@example.com,555-456-7890,$79500.00,$2850.00,21%,750,04/15/2023,Active,35,$61250.75,$3975.00,$34200.00
William Anderson,9/9/1973,will.anderson@example.com,(555) 567-8901,$81250.50,$3000.00,19%,725,2023-05-01,Active,50,$59000.25,$4062.50,$36000.00
Lisa Thomas,10-25-1992,lisa.t@example.com,555.678.9012,$68750.25,$2350.00,17%,715,05/15/2023,Active,31,$42500.00,$3437.50,$28200.00
James Jackson,11/11/1980,james.j@example.com,(555) 789-0123,$77500.00,$2800.00,22%,740,2023-06-01,Inactive,43,$56250.50,$3875.00,$33600.00
Amanda White,12/05/1987,amanda.w@example.com,555-890-1234,$84250.75,$3200.00,24%,760,06/15/2023,Active,36,$67500.25,$4212.50,$38400.00
Christopher Lee,1/20/1975,chris.lee@example.com,(555) 901-2345,$69500.50,$2450.00,16%,700,2023-07-01,Active,48,$43750.00,$3475.00,$29400.00
Jessica Brown,02/14/1993,jessica.b@example.com,555.012.3456,$76250.25,$2750.00,21%,730,07/15/2023,Active,30,$54000.75,$3812.50,$33000.00
Matthew Davis,3-30-1983,matt.d@example.com,5559876543,$82750.00,$3150.00,23%,755,2023/08/01,Inactive,40,$63500.50,$4137.50,$37800.00
Stephanie Martinez,04/17/1991,stephanie.m@example.com,(555)234-5678,$71500.75,$2600.00,19%,720,08/15/2023,Active,32,$48750.25,$3575.00,$31200.00
Daniel Thompson,5.5.1979,daniel.t@example.com,555 345 6789,$78250.50,$2900.00,20%,735,2023-09-01,Active,44,$57000.00,$3912.50,$34800.00
Nicole Garcia,06/22/1986,nicole.g@example.com,+1 555 456 7890,$85750.25,$3300.00,25%,765,09/15/2023,Active,37,$69250.50,$4287.50,$39600.00
Kevin Robinson,1981-07-08,kevin.r@example.com,(555) 567-8901,$73000.00,$2700.00,18%,710,2023-10-01,Inactive,42,$51500.75,$3650.00,$32400.00
Michelle Lewis,08/19/1994,michelle.l@example.com,555-678-9012,$80500.75,$3050.00,23%,750,10/15/2023,Active,29,$62750.25,$4025.00,$36600.00`

// Function to parse the sample data
export function getSampleData(): string[][] {
  const rows = sampleCsvData.split("\n")
  return rows.map((row) => row.split(","))
}

// Enhanced sample data with formulas
export const sampleCsvDataWithFormulas = `Name,Date of Birth,Email,Phone Number,Annual Income,Monthly Expenses,Savings Rate,Credit Score,Last Purchase,Status,Age,Account Balance,Investment Returns,Yearly Expenses
John Smith,1/15/1985,john.smith@example.com,(555) 123-4567,$75000.00,$2500.00,=E2*0.15,720,2023-01-15,Active,=2023-YEAR(B2),$45000.25,=E2*0.05,=F2*12
Jane Doe,02/28/1990,jane.doe@example.com,555.987.6543,$82500.00,$3100.00,=E3*0.22,745,01/30/2023,Active,=2023-YEAR(B3),$62150.75,=E3*0.05,=F3*12
Michael Johnson,3-17-1978,michael.j@example,5551234567,$65000,$2200.00,=E4*0.12,680,2023/02/15,Inactive,=2023-YEAR(B4),$28750.50,=E4*0.05,=F4*12
Emily Williams,,emily@example.com,(555)456-7890,$92000.50,$3800.00,=E5*0.25,790,,Active,=2023-YEAR(B5),$78500.00,=E5*0.05,=F5*12
David Brown,05/05/1982,david.brown@example.com,555 789 0123,$67500,$2400.00,=E6*0.18,705,2023-03-01,Active,=2023-YEAR(B6),$41250.25,=E6*0.05,=F6*12
Sarah Miller,6.12.1995,sarah.miller@example.com,+1 555 234 5678,$72000.75,$2650.00,=E7*0.20,735,03/15/2023,Active,=2023-YEAR(B7),$53600.50,=E7*0.05,=F7*12
Robert Wilson,1977-07-22,robert@example.com,(555) 345-6789,$58000.25,$1950.00,=E8*0.10,660,2023-04-01,Inactive,=2023-YEAR(B8),$22750.00,=E8*0.05,=F8*12
Jennifer Taylor,08/30/1988,jennifer.t@example.com,555-456-7890,$79500.00,$2850.00,=E9*0.21,750,04/15/2023,Active,=2023-YEAR(B9),$61250.75,=E9*0.05,=F9*12
William Anderson,9/9/1973,will.anderson@example.com,(555) 567-8901,$81250.50,$3000.00,=E10*0.19,725,2023-05-01,Active,=2023-YEAR(B10),$59000.25,=E10*0.05,=F10*12
Lisa Thomas,10-25-1992,lisa.t@example.com,555.678.9012,$68750.25,$2350.00,=E11*0.17,715,05/15/2023,Active,=2023-YEAR(B11),$42500.00,=E11*0.05,=F11*12
James Jackson,11/11/1980,james.j@example.com,(555) 789-0123,$77500.00,$2800.00,=E12*0.22,740,2023-06-01,Inactive,=2023-YEAR(B12),$56250.50,=E12*0.05,=F12*12
Amanda White,12/05/1987,amanda.w@example.com,555-890-1234,$84250.75,$3200.00,=E13*0.24,760,06/15/2023,Active,=2023-YEAR(B13),$67500.25,=E13*0.05,=F13*12
Christopher Lee,1/20/1975,chris.lee@example.com,(555) 901-2345,$69500.50,$2450.00,=E14*0.16,700,2023-07-01,Active,=2023-YEAR(B14),$43750.00,=E14*0.05,=F14*12
Jessica Brown,02/14/1993,jessica.b@example.com,555.012.3456,$76250.25,$2750.00,=E15*0.21,730,07/15/2023,Active,=2023-YEAR(B15),$54000.75,=E15*0.05,=F15*12
Matthew Davis,3-30-1983,matt.d@example.com,5559876543,$82750.00,$3150.00,=E16*0.23,755,2023/08/01,Inactive,=2023-YEAR(B16),$63500.50,=E16*0.05,=F16*12
Stephanie Martinez,04/17/1991,stephanie.m@example.com,(555)234-5678,$71500.75,$2600.00,=E17*0.19,720,08/15/2023,Active,=2023-YEAR(B17),$48750.25,=E17*0.05,=F17*12
Daniel Thompson,5.5.1979,daniel.t@example.com,555 345 6789,$78250.50,$2900.00,=E18*0.20,735,2023-09-01,Active,=2023-YEAR(B18),$57000.00,=E18*0.05,=F18*12
Nicole Garcia,06/22/1986,nicole.g@example.com,+1 555 456 7890,$85750.25,$3300.00,=E19*0.25,765,09/15/2023,Active,=2023-YEAR(B19),$69250.50,=E19*0.05,=F19*12
Kevin Robinson,1981-07-08,kevin.r@example.com,(555) 567-8901,$73000.00,$2700.00,=E20*0.18,710,2023-10-01,Inactive,=2023-YEAR(B20),$51500.75,=E20*0.05,=F20*12
Michelle Lewis,08/19/1994,michelle.l@example.com,555-678-9012,$80500.75,$3050.00,=E21*0.23,750,10/15/2023,Active,=2023-YEAR(B21),$62750.25,=E21*0.05,=F21*12`

// Function to parse the sample data with formulas
export function getSampleDataWithFormulas(): string[][] {
  const rows = sampleCsvDataWithFormulas.split("\n")
  return rows.map((row) => row.split(","))
}

