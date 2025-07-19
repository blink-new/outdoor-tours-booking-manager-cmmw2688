import React, { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { blink } from '../blink/client'

interface CSVRow {
  [key: string]: string
}

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ImportStats {
  total: number
  successful: number
  failed: number
}

const REQUIRED_FIELDS = ['customer_name', 'tour_type', 'booking_date', 'email']
const OPTIONAL_FIELDS = ['phone', 'group_size', 'special_requirements', 'status', 'total_amount']

export function CSVImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidDate = (date: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date))
  }

  const validateData = useCallback((data: CSVRow[], headers: string[]) => {
    const errors: ValidationError[] = []

    // Check for required headers
    REQUIRED_FIELDS.forEach(field => {
      if (!headers.includes(field)) {
        errors.push({
          row: 0,
          field,
          message: `Required column '${field}' is missing`
        })
      }
    })

    // Validate each row
    data.forEach((row, index) => {
      REQUIRED_FIELDS.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push({
            row: index + 1,
            field,
            message: `Required field '${field}' is empty`
          })
        }
      })

      // Validate email format
      if (row.email && !isValidEmail(row.email)) {
        errors.push({
          row: index + 1,
          field: 'email',
          message: 'Invalid email format'
        })
      }

      // Validate date format
      if (row.booking_date && !isValidDate(row.booking_date)) {
        errors.push({
          row: index + 1,
          field: 'booking_date',
          message: 'Invalid date format (use YYYY-MM-DD)'
        })
      }

      // Validate group size
      if (row.group_size && (isNaN(Number(row.group_size)) || Number(row.group_size) < 1)) {
        errors.push({
          row: index + 1,
          field: 'group_size',
          message: 'Group size must be a positive number'
        })
      }
    })

    setValidationErrors(errors)
  }, [])

  const parseCSV = useCallback((text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      alert('CSV file must have at least a header row and one data row')
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows: CSVRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: CSVRow = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      rows.push(row)
    }

    setHeaders(headers)
    setCsvData(rows)
    validateData(rows, headers)
    setShowPreview(true)
  }, [validateData])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return

    if (!uploadedFile.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }

    setFile(uploadedFile)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSV(text)
    }
    
    reader.readAsText(uploadedFile)
  }, [parseCSV])

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before importing')
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    
    const stats: ImportStats = { total: csvData.length, successful: 0, failed: 0 }

    try {
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i]
        
        try {
          await blink.db.bookings.create({
            customer_name: row.customer_name,
            email: row.email,
            phone: row.phone || '',
            tour_type: row.tour_type,
            booking_date: row.booking_date,
            group_size: row.group_size ? parseInt(row.group_size) : 1,
            special_requirements: row.special_requirements || '',
            status: row.status || 'pending',
            total_amount: row.total_amount ? parseFloat(row.total_amount) : 0,
            created_at: new Date().toISOString(),
            user_id: 'system' // You might want to use actual user ID
          })
          
          stats.successful++
        } catch (error) {
          console.error(`Failed to import row ${i + 1}:`, error)
          stats.failed++
        }
        
        setImportProgress(((i + 1) / csvData.length) * 100)
      }
    } catch (error) {
      console.error('Import failed:', error)
    }

    setImportStats(stats)
    setIsImporting(false)
  }

  const resetImporter = () => {
    setFile(null)
    setCsvData([])
    setHeaders([])
    setValidationErrors([])
    setShowPreview(false)
    setImportStats(null)
    setImportProgress(0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CSV Import
          </CardTitle>
          <CardDescription>
            Import booking data from CSV files. Required columns: customer_name, tour_type, booking_date, email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPreview ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload CSV File</p>
                  <p className="text-sm text-gray-500">
                    Select a CSV file containing booking data
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button className="mt-4" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-700 mb-1">Required Columns:</p>
                    <ul className="space-y-1 text-gray-600">
                      {REQUIRED_FIELDS.map(field => (
                        <li key={field}>• {field}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700 mb-1">Optional Columns:</p>
                    <ul className="space-y-1 text-gray-600">
                      {OPTIONAL_FIELDS.map(field => (
                        <li key={field}>• {field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{file?.name}</span>
                  <Badge variant="secondary">{csvData.length} rows</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={resetImporter}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">{validationErrors.length} validation error(s) found:</p>
                      <ul className="text-sm space-y-1">
                        {validationErrors.slice(0, 5).map((error, index) => (
                          <li key={index}>
                            Row {error.row}: {error.message}
                          </li>
                        ))}
                        {validationErrors.length > 5 && (
                          <li>... and {validationErrors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Import Progress */}
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing...</span>
                    <span>{Math.round(importProgress)}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {/* Import Stats */}
              {importStats && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Import completed: {importStats.successful} successful, {importStats.failed} failed out of {importStats.total} total records.
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Preview */}
              <div className="space-y-2">
                <h4 className="font-medium">Data Preview (first 5 rows)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map(header => (
                          <TableHead key={header} className="whitespace-nowrap">
                            {header}
                            {REQUIRED_FIELDS.includes(header) && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          {headers.map(header => (
                            <TableCell key={header} className="whitespace-nowrap">
                              {row[header] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Import Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleImport}
                  disabled={validationErrors.length > 0 || isImporting}
                  className="min-w-32"
                >
                  {isImporting ? 'Importing...' : `Import ${csvData.length} Records`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}