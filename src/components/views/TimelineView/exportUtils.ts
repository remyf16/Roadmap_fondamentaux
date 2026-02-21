export async function exportElementToImage(
  element: HTMLElement,
  filename: string,
  format: "png" | "jpg"
) {
  const html2canvas = (await import("html2canvas")).default;

  // On attend un peu pour être sûr que les styles sont appliqués
  await new Promise((resolve) => setTimeout(resolve, 100));

  const canvas = await html2canvas(element, {
    scale: 2, // Meilleure qualité
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false, // Réduit le bruit dans la console
    // Ces options aident à éviter les erreurs de parsing CSS complexes
    onclone: (clonedDoc) => {
    const root = clonedDoc.getElementById("timeline-export-root");
    if (root) root.style.fontFamily = "Arial, Helvetica, sans-serif";

    const bars = clonedDoc.querySelectorAll<HTMLElement>('[data-export="task-bar"]');
    bars.forEach((bar) => {
        // neutralise flex/transform éventuels (html2canvas aime pas)
        bar.style.display = "block";
        bar.style.alignItems = "";
        bar.style.justifyContent = "";
    });

    const labels = clonedDoc.querySelectorAll<HTMLElement>('[data-export="task-label"]');
    labels.forEach((label) => {
        // centrage vertical ROBUSTE pour html2canvas
        label.style.position = "absolute";
        label.style.left = "8px";
        label.style.right = "8px";
        label.style.top = "0px";
        label.style.height = "20px";
        label.style.lineHeight = "20px";      // ✅ le coeur du fix
        label.style.transform = "none";       // ✅ au cas où
        label.style.marginTop = "0";
        label.style.display = "block";
        label.style.paddingLeft = "0";        // on gère left:8px
        label.style.overflow = "hidden";
        label.style.textOverflow = "ellipsis";
        label.style.whiteSpace = "nowrap";
    });
    }

  });

  const mime = format === "png" ? "image/png" : "image/jpeg";
  const dataUrl = canvas.toDataURL(mime, 0.95);

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export async function exportElementToPDF(element: HTMLElement, filename: string) {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  // Petit délai de sécurité
  await new Promise((resolve) => setTimeout(resolve, 100));

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  // PDF A4 paysage (landscape "l") souvent mieux pour les timelines, ou portrait "p"
  // Ici on garde "p" (portrait) comme demandé, ou on adapte au contenu
  const pdf = new jsPDF("p", "pt", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = 0;
  let remaining = imgHeight;

  pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
  remaining -= pageHeight;

  while (remaining > 0) {
    pdf.addPage();
    y -= pageHeight;
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    remaining -= pageHeight;
  }

  pdf.save(filename);
}