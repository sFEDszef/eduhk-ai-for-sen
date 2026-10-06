import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
} from "docx";
import type { GenerationResult } from "@/types/generation";
import { exportBlocks } from "./content";
export function createDocument(result: GenerationResult): Document {
  const heading = {
    title: HeadingLevel.TITLE,
    heading: HeadingLevel.HEADING_1,
    subheading: HeadingLevel.HEADING_2,
  } as const;
  const paragraphs = exportBlocks(result).map((block) =>
    block.kind === "break"
      ? new Paragraph({ children: [new PageBreak()] })
      : new Paragraph({
          heading: block.kind === "body" ? undefined : heading[block.kind],
          children: block.text
            .split("\n")
            .map(
              (line, index) =>
                new TextRun({ text: line, break: index ? 1 : undefined }),
            ),
          spacing: { after: 160, line: 320 },
          keepNext: block.kind !== "body",
          widowControl: true,
        }),
  );
  return new Document({
    creator: "AI for SEN",
    title: result.material.title,
    styles: {
      default: {
        document: {
          run: {
            font: {
              ascii: "Arial",
              hAnsi: "Arial",
              eastAsia: "Microsoft JhengHei",
            },
            size: 24,
            color: "000000",
          },
          paragraph: { spacing: { after: 160, line: 320 } },
        },
      },
      paragraphStyles: [
        {
          id: "Title",
          name: "Title",
          basedOn: "Normal",
          next: "Normal",
          run: { size: 36, bold: true, color: "000000" },
          paragraph: { spacing: { after: 240 }, keepNext: true },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: { size: 30, bold: true, color: "000000" },
          paragraph: { spacing: { before: 240, after: 160 }, keepNext: true },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: { size: 25, bold: true, color: "000000" },
          paragraph: { spacing: { before: 160, after: 120 }, keepNext: true },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
          },
        },
        children: paragraphs,
      },
    ],
  });
}
export function docxBlob(result: GenerationResult): Promise<Blob> {
  return Packer.toBlob(createDocument(result));
}
export function docxBuffer(result: GenerationResult): Promise<Buffer> {
  return Packer.toBuffer(createDocument(result));
}
