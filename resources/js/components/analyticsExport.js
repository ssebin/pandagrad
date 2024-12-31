import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

export function exportToPDF() {
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
            const marginLeft = 10; // Adjust as needed
            const marginRight = 10; // Adjust as needed
            const marginTop = 10; // Adjust as needed
            const marginBottom = 10; // Adjust as needed

            // Calculate available width and height for the image
            const imgWidth = pageWidth - marginLeft - marginRight;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let position = marginTop;

            // Check if the content exceeds one page
            if (imgHeight + marginTop + marginBottom > pageHeight) {
                // Handle multi-page content
                let remainingHeight = imgHeight;
                let pageCount = 0;

                while (remainingHeight > 0) {
                    const currentHeight = Math.min(
                        remainingHeight,
                        pageHeight - marginTop - marginBottom
                    );
                    const canvasFragment = document.createElement("canvas");
                    canvasFragment.width = canvas.width;
                    canvasFragment.height =
                        (currentHeight * canvas.width) / imgWidth;

                    const ctx = canvasFragment.getContext("2d");
                    ctx.drawImage(
                        canvas,
                        0,
                        (imgHeight - remainingHeight) *
                            (canvas.width / imgWidth),
                        canvas.width,
                        canvasFragment.height,
                        0,
                        0,
                        canvas.width,
                        canvasFragment.height
                    );

                    const fragmentImgData =
                        canvasFragment.toDataURL("image/png");
                    if (pageCount > 0) {
                        pdf.addPage();
                    }

                    pdf.addImage(
                        fragmentImgData,
                        "PNG",
                        marginLeft,
                        marginTop,
                        imgWidth,
                        currentHeight
                    );

                    remainingHeight -= currentHeight;
                    pageCount++;
                }
            } else {
                // Add image with margins
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
            pdf.save("analytics.pdf");
        })
        .catch((err) => {
            console.error("Error generating PDF:", err);
            alert("Failed to generate PDF");
        });
}

import ExcelJS from "exceljs";

// Function to export data to Excel with styling
export async function exportToExcel(statisticsData, chartsData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Analytics");

    let rowIndex = 1;

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
    statisticsData.forEach((stat) => {
        let row = worksheet.getRow(rowIndex);
        row.getCell(1).value = stat.label;
        row.getCell(2).value = stat.value;
        rowIndex++;
    });

    // Leave an empty row
    rowIndex++;

    // Add Charts Data
    for (const key in chartsData) {
        const chartData = chartsData[key];

        // Add Chart Title
        worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
        let chartTitleRow = worksheet.getRow(rowIndex);
        chartTitleRow.getCell(1).value = chartData.datasets[0].label;
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
    saveAs(blob, "analytics.xlsx");
}
