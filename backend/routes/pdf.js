const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');

router.post('/generate-latex', async (req, res) => {
  try {
    const user = req.body;

    const latexTemplate = await fs.readFile('./templates/resume_template.tex', 'utf8');

    const compiledLatex = latexTemplate
      .replace('{{NAME}}', `${user.profile.firstName} ${user.profile.lastName}`)
      .replace('{{EMAIL}}', user.email)
      .replace('{{PHONE}}', user.phoneNumber)
      .replace('{{SUMMARY}}', user.resume.summary || '')
      .replace('{{SKILLS}}', user.resume.skills?.join(', ') || '')
      .replace('{{EXPERIENCE}}', user.resume.experience?.map(e =>
        `${e.position} at ${e.company} (${new Date(e.startDate).getFullYear()} - ${new Date(e.endDate).getFullYear()})`
      ).join('\n') || '')
      .replace('{{EDUCATION}}', user.resume.education?.map(ed =>
        `${ed.degree} in ${ed.fieldOfStudy}, ${ed.institution} (${ed.startYear} - ${ed.endYear})`
      ).join('\n') || '');

    const outputDir = path.join(__dirname, '../output');
    const texPath = path.join(outputDir, 'output.tex');
    const pdfPath = path.join(outputDir, 'output.pdf');

    await fs.outputFile(texPath, compiledLatex);

    exec(`pdflatex -output-directory=output ${texPath}`, (err) => {
      if (err) return res.status(500).send('Error compiling LaTeX');

      res.download(pdfPath, 'resume.pdf');
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong generating PDF');
  }
});

module.exports = router;
