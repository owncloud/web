import { rgb } from 'pdf-lib'

export const PDF_THEME = Object.freeze({
  layout: {
    margin: 50,
    pageBottom: 50
  },
  font: {
    baseSize: 12,
    lineHeight: 16,
    subSupSize: 9,
    headingBaseSize: 24,
    headingDepthMultiplier: 2,
    headingMinSize: 14,
    codeSize: 10,
    codeLineHeight: 14,
    listBulletSize: 12,
    listItemLineHeight: 16,
    blockquoteLineHeight: 16,
    tableHeaderTextSize: 11,
    tableHeaderLineHeight: 14,
    tableCellTextSize: 10,
    imageTitleSize: 10
  },
  offset: {
    subscript: -3,
    superscript: 4
  },
  color: {
    text: rgb(0, 0, 0),
    link: rgb(0, 0, 0.8),
    error: rgb(0.8, 0.2, 0.2),
    codeSpan: rgb(0.7, 0.1, 0.1),
    codeBlockBg: rgb(0.15625, 0.171875, 0.203125),
    codeBlockText: rgb(0.875, 0.875, 0.875),
    blockquoteBar: rgb(0.7, 0.7, 0.7),
    blockquoteText: rgb(0.3, 0.3, 0.3),
    tableHeaderBg: rgb(0.9, 0.9, 0.9),
    tableBorder: rgb(0.5, 0.5, 0.5),
    hr: rgb(0.5, 0.5, 0.5),
    imagePlaceholder: rgb(0.5, 0.5, 0.5)
  },
  spacing: {
    beforeParagraph: 20,
    afterParagraph: 10,
    afterHeading: 15,
    afterCodeBlock: 15,
    afterList: 10,
    afterBlockquote: 15,
    afterTable: 15,
    afterHr: 20,
    forSpaceToken: 10,
    afterImage: 10,
    beforeImageTitle: 20,
    listItemYDecrement: 18,
    listItemIndent: 20,
    blockquoteYDecrement: 20,
    hrYDecrement: 20,
    tableYDecrement: 20
  },
  codeBlock: {
    padding: 10
  },
  table: {
    cellPadding: 8,
    rowHeight: 30
  },
  blockquote: {
    barWidth: 3,
    barXOffset: 10,
    contentPadding: 40
  },
  hr: {
    thickness: 1
  },
  image: {
    contentPadding: 40
  },
  math: {
    displayModePadding: 20,
    inlineModePadding: 5
  },
  svg: {
    scaleFactor: 3
  },
  underline: {
    thickness: 1,
    offset: -3
  },
  strikeThrough: {
    thickness: 1
  }
} as const)
