import { Request, Response } from "express";
import { Disease } from "../../database/mongodb/models/Disease";
import { parse } from "csv-parse";
import { Readable } from "stream";
import { 
  validateFile, 
  validateRecordCount, 
  sanitizeDiseaseRecord, 
  logSecurityEvent 
} from "../lib/importSecurity";

export async function getDiseases(req: Request, res: Response) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      severity,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.$or = [
        { category: category },
        { categories: category }
      ];
    }
    
    if (severity) {
      query.severity = severity;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

    const [diseases, total] = await Promise.all([
      Disease.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Disease.countDocuments(query)
    ]);

    res.json({
      diseases,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching diseases:", error);
    res.status(500).json({ error: "Failed to fetch diseases" });
  }
}

export async function getDiseaseById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const disease = await Disease.findById(id);
    
    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }
    
    res.json(disease);
  } catch (error) {
    console.error("Error fetching disease:", error);
    res.status(500).json({ error: "Failed to fetch disease" });
  }
}

export async function createDisease(req: Request, res: Response) {
  try {
    const diseaseData = req.body;
    
    const existing = await Disease.findOne({ name: diseaseData.name });
    if (existing) {
      return res.status(400).json({ error: "Disease with this name already exists" });
    }
    
    const disease = new Disease(diseaseData);
    await disease.save();
    
    res.status(201).json(disease);
  } catch (error) {
    console.error("Error creating disease:", error);
    res.status(500).json({ error: "Failed to create disease" });
  }
}

export async function updateDisease(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const disease = await Disease.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }
    
    res.json(disease);
  } catch (error) {
    console.error("Error updating disease:", error);
    res.status(500).json({ error: "Failed to update disease" });
  }
}

export async function deleteDisease(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const disease = await Disease.findByIdAndDelete(id);
    
    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }
    
    res.json({ message: "Disease deleted successfully" });
  } catch (error) {
    console.error("Error deleting disease:", error);
    res.status(500).json({ error: "Failed to delete disease" });
  }
}

interface CSVDiseaseRow {
  name: string;
  category: string;
  categories?: string;
  severity: string;
  definition: string;
  symptoms: string;
  causes: string;
  testsAndProcedures: string;
  medications?: string;
  treatments?: string;
  prevention: string;
  prognosis: string;
  prevalence: string;
}

function parseArrayField(value: string | undefined): string[] {
  if (!value || value.trim() === '') return [];
  return value.split('|').map(item => item.trim()).filter(item => item !== '');
}

export async function importDiseasesFromCSV(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileValidation = validateFile(req.file);
    if (!fileValidation.isValid) {
      logSecurityEvent('FILE_VALIDATION_FAILED', { 
        filename: req.file.originalname,
        errors: fileValidation.errors,
        ip: req.ip,
        userId: (req as any).user?.id
      });
      return res.status(400).json({ 
        error: "File validation failed", 
        details: fileValidation.errors 
      });
    }

    const isJSON = req.file.originalname.endsWith('.json') || req.file.mimetype === 'application/json';
    
    if (isJSON) {
      return importDiseasesFromJSON(req, res);
    }

    const results: { created: number; updated: number; errors: { row: number; error: string }[] } = {
      created: 0,
      updated: 0,
      errors: []
    };

    const records: CSVDiseaseRow[] = [];
    
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    const stream = Readable.from(req.file.buffer);
    
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(parser)
        .on('data', (row: CSVDiseaseRow) => {
          records.push(row);
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    const recordCountValidation = validateRecordCount(records.length);
    if (!recordCountValidation.isValid) {
      logSecurityEvent('RECORD_COUNT_EXCEEDED', { 
        count: records.length,
        ip: req.ip,
        userId: (req as any).user?.id
      });
      return res.status(400).json({ 
        error: "Too many records", 
        details: recordCountValidation.errors 
      });
    }

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2;

      try {
        const { sanitized, errors: sanitizeErrors } = sanitizeDiseaseRecord({
          name: row.name,
          category: row.category,
          categories: row.categories,
          severity: row.severity,
          definition: row.definition,
          symptoms: row.symptoms,
          causes: row.causes,
          testsAndProcedures: row.testsAndProcedures,
          medications: row.medications,
          treatments: row.treatments,
          prevention: row.prevention,
          prognosis: row.prognosis,
          prevalence: row.prevalence
        });

        if (sanitizeErrors.length > 0) {
          logSecurityEvent('RECORD_SANITIZATION_ISSUES', { 
            row: rowNum, 
            errors: sanitizeErrors,
            ip: req.ip
          });
          results.errors.push({ row: rowNum, error: sanitizeErrors.join('; ') });
          continue;
        }

        if (!sanitized.name || !sanitized.category || !sanitized.severity || !sanitized.definition) {
          results.errors.push({ row: rowNum, error: "Missing required fields (name, category, severity, definition)" });
          continue;
        }

        const diseaseData = {
          name: sanitized.name,
          category: sanitized.category,
          categories: typeof sanitized.categories === 'string' ? parseArrayField(sanitized.categories) : sanitized.categories,
          severity: sanitized.severity,
          definition: sanitized.definition,
          symptoms: typeof sanitized.symptoms === 'string' ? parseArrayField(sanitized.symptoms) : sanitized.symptoms,
          causes: typeof sanitized.causes === 'string' ? parseArrayField(sanitized.causes) : sanitized.causes,
          testsAndProcedures: typeof sanitized.testsAndProcedures === 'string' ? parseArrayField(sanitized.testsAndProcedures) : sanitized.testsAndProcedures,
          medications: typeof sanitized.medications === 'string' ? parseArrayField(sanitized.medications) : sanitized.medications,
          treatments: typeof sanitized.treatments === 'string' ? parseArrayField(sanitized.treatments) : sanitized.treatments,
          prevention: typeof sanitized.prevention === 'string' ? parseArrayField(sanitized.prevention) : sanitized.prevention,
          prognosis: sanitized.prognosis || '',
          prevalence: sanitized.prevalence || ''
        };

        const existing = await Disease.findOne({ name: diseaseData.name });
        
        if (existing) {
          await Disease.findByIdAndUpdate(existing._id, diseaseData);
          results.updated++;
        } else {
          const disease = new Disease(diseaseData);
          await disease.save();
          results.created++;
        }
      } catch (err: any) {
        results.errors.push({ row: rowNum, error: err.message || "Unknown error" });
      }
    }

    res.json({
      message: "CSV import completed",
      created: results.created,
      updated: results.updated,
      errors: results.errors,
      totalProcessed: records.length
    });
  } catch (error: any) {
    console.error("Error importing CSV:", error);
    res.status(500).json({ error: "Failed to import CSV", details: error.message });
  }
}

export async function exportDiseasesToCSV(_req: Request, res: Response) {
  try {
    const diseases = await Disease.find().lean();
    
    const headers = [
      'name', 'category', 'categories', 'severity', 'definition',
      'symptoms', 'causes', 'testsAndProcedures', 'medications',
      'treatments', 'prevention', 'prognosis', 'prevalence'
    ];
    
    const rows = diseases.map(d => [
      d.name,
      d.category,
      (d.categories || []).join('|'),
      d.severity,
      d.definition,
      (d.symptoms || []).join('|'),
      (d.causes || []).join('|'),
      (d.testsAndProcedures || []).join('|'),
      (d.medications || []).join('|'),
      (d.treatments || []).join('|'),
      (d.prevention || []).join('|'),
      d.prognosis,
      d.prevalence
    ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(','));
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=diseases-export.csv');
    res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ error: "Failed to export diseases" });
  }
}

async function importDiseasesFromJSON(req: Request, res: Response) {
  try {
    const results: { created: number; updated: number; errors: { row: number; error: string }[] } = {
      created: 0,
      updated: 0,
      errors: []
    };

    let jsonData: any[];
    
    try {
      const fileContent = req.file!.buffer.toString('utf-8');
      jsonData = JSON.parse(fileContent);
      
      if (!Array.isArray(jsonData)) {
        jsonData = [jsonData];
      }
    } catch (parseError) {
      logSecurityEvent('JSON_PARSE_ERROR', { 
        filename: req.file?.originalname,
        ip: req.ip,
        userId: (req as any).user?.id
      });
      return res.status(400).json({ error: "Invalid JSON format" });
    }

    const recordCountValidation = validateRecordCount(jsonData.length);
    if (!recordCountValidation.isValid) {
      logSecurityEvent('RECORD_COUNT_EXCEEDED', { 
        count: jsonData.length,
        ip: req.ip,
        userId: (req as any).user?.id
      });
      return res.status(400).json({ 
        error: "Too many records", 
        details: recordCountValidation.errors 
      });
    }

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 1;

      try {
        const { sanitized, errors: sanitizeErrors } = sanitizeDiseaseRecord(row);

        if (sanitizeErrors.length > 0) {
          logSecurityEvent('RECORD_SANITIZATION_ISSUES', { 
            row: rowNum, 
            errors: sanitizeErrors,
            ip: req.ip
          });
          results.errors.push({ row: rowNum, error: sanitizeErrors.join('; ') });
          continue;
        }

        if (!sanitized.name || !sanitized.category || !sanitized.severity || !sanitized.definition) {
          results.errors.push({ row: rowNum, error: "Missing required fields (name, category, severity, definition)" });
          continue;
        }

        const diseaseData = {
          name: sanitized.name,
          category: sanitized.category,
          categories: Array.isArray(sanitized.categories) ? sanitized.categories : [],
          severity: sanitized.severity,
          definition: sanitized.definition,
          symptoms: Array.isArray(sanitized.symptoms) ? sanitized.symptoms : [],
          causes: Array.isArray(sanitized.causes) ? sanitized.causes : [],
          testsAndProcedures: Array.isArray(sanitized.testsAndProcedures) ? sanitized.testsAndProcedures : [],
          medications: Array.isArray(sanitized.medications) ? sanitized.medications : [],
          treatments: Array.isArray(sanitized.treatments) ? sanitized.treatments : [],
          prevention: Array.isArray(sanitized.prevention) ? sanitized.prevention : [],
          prognosis: sanitized.prognosis || '',
          prevalence: sanitized.prevalence || ''
        };

        const existing = await Disease.findOne({ name: diseaseData.name });
        
        if (existing) {
          await Disease.findByIdAndUpdate(existing._id, diseaseData);
          results.updated++;
        } else {
          const disease = new Disease(diseaseData);
          await disease.save();
          results.created++;
        }
      } catch (err: any) {
        results.errors.push({ row: rowNum, error: err.message || "Unknown error" });
      }
    }

    res.json({
      message: "JSON import completed",
      created: results.created,
      updated: results.updated,
      errors: results.errors,
      totalProcessed: jsonData.length
    });
  } catch (error: any) {
    console.error("Error importing JSON:", error);
    res.status(500).json({ error: "Failed to import JSON", details: error.message });
  }
}
