import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

export function exportToPDF(selectedProgram, selectedSemester) {
    const input = document.getElementById("pdf-content");

    // Ensure the element exists
    if (!input) {
        console.error("PDF content element not found");
        return;
    }

    // Scroll to top to capture content correctly
    window.scrollTo(0, 0);

    html2canvas(input, { scale: 2 })
        .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");

            // Get page dimensions
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Define margins in mm
            const marginLeft = 10;
            const marginTop = 10;
            const marginRight = 10;
            const marginBottom = 10;

            // Add header for Program and Semester
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.text(`Program: ${selectedProgram}`, marginLeft, marginTop);
            pdf.setFontSize(14);
            pdf.text(`Intake: ${selectedSemester}`, marginLeft, marginTop + 8);

            // Adjust position for content
            const headerHeight = 12; // Space for header
            const imgWidth = pageWidth - marginLeft - marginRight;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let position = marginTop + headerHeight;

            // Check if the content exceeds one page
            if (imgHeight + position + marginBottom > pageHeight) {
                // Handle multi-page content
                let remainingHeight = imgHeight;
                let pageCount = 0;

                while (remainingHeight > 0) {
                    const currentHeight = Math.min(
                        remainingHeight,
                        pageHeight - position - marginBottom
                    );

                    const fragmentCanvas = document.createElement("canvas");
                    fragmentCanvas.width = canvas.width;
                    fragmentCanvas.height =
                        (currentHeight * canvas.width) / imgWidth;

                    const ctx = fragmentCanvas.getContext("2d");
                    ctx.drawImage(
                        canvas,
                        0,
                        (imgHeight - remainingHeight) *
                            (canvas.width / imgWidth),
                        canvas.width,
                        fragmentCanvas.height,
                        0,
                        0,
                        canvas.width,
                        fragmentCanvas.height
                    );

                    const fragmentImgData =
                        fragmentCanvas.toDataURL("image/png");
                    if (pageCount > 0) {
                        pdf.addPage();
                        pdf.text(
                            `Program: ${selectedProgram}`,
                            marginLeft,
                            marginTop
                        );
                        pdf.text(
                            `Intake: ${selectedSemester}`,
                            marginLeft,
                            marginTop + 8
                        );
                        position = marginTop + headerHeight;
                    }

                    pdf.addImage(
                        fragmentImgData,
                        "PNG",
                        marginLeft,
                        position,
                        imgWidth,
                        currentHeight
                    );

                    remainingHeight -= currentHeight;
                    pageCount++;
                }
            } else {
                // Single-page content
                pdf.addImage(
                    imgData,
                    "PNG",
                    marginLeft,
                    position,
                    imgWidth,
                    imgHeight
                );
            }

            // Save the PDF
            pdf.save(`${selectedProgram}_${selectedSemester}_analytics.pdf`);
        })
        .catch((err) => {
            console.error("Error generating PDF:", err);
            alert("Failed to generate PDF");
        });
}

import ExcelJS from "exceljs";

export async function exportToExcel(
    statisticsData,
    chartsData,
    selectedProgram,
    selectedSemester
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Analytics");

    let rowIndex = 1;

    // Add Program and Semester Header
    worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
    let titleHeaderRow = worksheet.getRow(rowIndex);
    titleHeaderRow.getCell(1).value = `Program: ${selectedProgram}`;
    titleHeaderRow.getCell(1).font = { bold: true, size: 16 };
    titleHeaderRow.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    rowIndex++;

    worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
    let subHeaderRow = worksheet.getRow(rowIndex);
    subHeaderRow.getCell(1).value = `Intake: ${selectedSemester}`;
    subHeaderRow.getCell(1).font = { bold: true, size: 14 };
    subHeaderRow.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    rowIndex += 2; // Add extra space after headers

    // Get data for the selected program and semester
    const programStatistics =
        statisticsData[selectedProgram]?.[selectedSemester] || [];
    const semesterCharts =
        chartsData[selectedProgram]?.[selectedSemester] || {};

    // Add 'Statistics' Section
    worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
    let titleRow = worksheet.getRow(rowIndex);
    titleRow.getCell(1).value = "Overall Status";
    titleRow.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    titleRow.getCell(1).font = { bold: true, size: 14 };
    titleRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC000" }, // Light orange
    };
    rowIndex++;

    // Add Statistics Headers
    let headerRow = worksheet.getRow(rowIndex);
    headerRow.values = ["Label", "Value"];
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4472C4" }, // Blue
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    rowIndex++;

    // Add Statistics Data
    programStatistics.forEach((stat) => {
        let row = worksheet.getRow(rowIndex);
        row.getCell(1).value = stat.label;
        row.getCell(2).value = stat.value;
        rowIndex++;
    });

    // Leave an empty row
    rowIndex++;

    // Add Charts Data
    for (const [key, chartData] of Object.entries(semesterCharts)) {
        // Add Chart Title
        worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
        let chartTitleRow = worksheet.getRow(rowIndex);
        chartTitleRow.getCell(1).value = chartData.datasets[0]?.label || key;
        chartTitleRow.getCell(1).alignment = {
            horizontal: "center",
            vertical: "middle",
        };
        chartTitleRow.getCell(1).font = { bold: true, size: 14 };
        chartTitleRow.getCell(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFC000" }, // Light orange
        };
        rowIndex++;

        // Add Chart Headers
        let chartHeaderRow = worksheet.getRow(rowIndex);
        let headers = ["Label"];
        chartData.datasets.forEach((dataset) => {
            headers.push(dataset.label);
        });
        chartHeaderRow.values = headers;
        chartHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "4472C4" }, // Blue
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });
        rowIndex++;

        // Add Chart Data
        chartData.labels.forEach((label, index) => {
            let row = worksheet.getRow(rowIndex);
            let rowData = [label];
            chartData.datasets.forEach((dataset) => {
                rowData.push(dataset.data[index]);
            });
            row.values = rowData;
            rowIndex++;
        });

        // Leave an empty row
        rowIndex++;
    }

    // Set Column Widths
    worksheet.columns.forEach((column) => {
        column.width = 20; // Adjust the column width as needed
    });

    // Generate Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${selectedProgram}_${selectedSemester}_analytics.xlsx`);
}
