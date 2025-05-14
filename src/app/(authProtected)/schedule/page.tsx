'use client'

import React, { useState, ChangeEvent, KeyboardEvent, MouseEvent, useEffect, useRef } from "react";
import { Mail, Upload, ChevronDown, ChevronUp, Clock, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface EmailFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content: string;
}

interface ImportedData {
  [key: string]: string | number | boolean | null;
}


const fmtSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

const getTimeOpts = (): string[] => {
  const opts: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 15, 30, 45]) {
      const fmtHour = hour.toString().padStart(2, "0");
      const fmtMin = minute.toString().padStart(2, "0");
      opts.push(`${fmtHour}:${fmtMin}`);
    }
  }
  return opts;
};

const EmailComposer: React.FC = () => {
  const [subj, setSubj] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [useHtml, setUseHtml] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [files, setFiles] = useState<EmailFile[]>([]);
  const [showConf, setShowConf] = useState<boolean>(false);
  const [newRecip, setNewRecip] = useState<string>("");
  const [recips, setRecips] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [schedValid, setSchedValid] = useState<boolean>(true);
  const [schedErr, setSchedErr] = useState<string | null>(null);
  const visRecips = 5;
  const [showAll, setShowAll] = useState<boolean>(false);
  const [impErr, setImpErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [impSuccess, setImpSuccess] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const recipRef = useRef<HTMLInputElement>(null);

  const timeOpts = getTimeOpts();

  useEffect(() => {
    const reqFilled = subj.trim() !== "" && body.trim() !== "" && recips.length > 0;
    let timeOk = true;
    let errMsg: string | null = null;

    if (date && time) {
      const now = new Date();
      const selDt = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      selDt.setHours(hours, minutes);

      const diffMs = selDt.getTime() - now.getTime();
      const diffMin = diffMs / (1000 * 60);

      if (diffMin < 15) {
        timeOk = false;
        errMsg = "Scheduled time must be at least 15 minutes in the future";
      }
    }

    setSchedValid(timeOk);
    setSchedErr(errMsg);

    const schedSpec = date !== undefined && time !== "";
    const finalValid = reqFilled && (!schedSpec || (schedSpec && timeOk));

    setIsValid(finalValid);
  }, [subj, body, recips, date, time]);

  const valEmail = (email: string): boolean => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const addRecip = (): void => {
    if (!newRecip.trim()) return;

    if (valEmail(newRecip)) {
      if (!recips.includes(newRecip)) {
        setRecips(prev => [...prev, newRecip]);
        setNewRecip("");
        setImpErr(null);
      } else {
        setImpErr("This email is already in the recipient list");
        setTimeout(() => setImpErr(null), 3000);
      }
    } else {
      setImpErr("Please enter a valid email address");
      setTimeout(() => setImpErr(null), 3000);
    }

    if (recipRef.current) {
      recipRef.current.focus();
    }
  };

  const rmRecip = (recipient: string): void => {
    setRecips(recips.filter((r) => r !== recipient));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      const readFiles: EmailFile[] = await Promise.all<EmailFile>(
        files.map((file) => {
          return new Promise<EmailFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                content: reader.result as string,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      setFiles((prev) => [...prev, ...readFiles]);
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  const rmFile = (fileName: string): void => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const toggleShowAll = (): void => {
    setShowAll(!showAll);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecip();
    }
  };

  const handleImportClick = (): void => {
    if (csvRef.current) {
      csvRef.current.click();
    }
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImpErr(null);
    setImpSuccess(null);

    if (file.type === 'text/csv') {
      Papa.parse<ImportedData>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImport(results.data as ImportedData[]);
        },
        error: (error: Error) => {
          setImpErr(`Error parsing CSV: ${error.message}`);
        }
      });
    }
    else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          if (e.target?.result) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            processImport(json as ImportedData[]);
          }
        } catch (error) {
          setImpErr(`Error parsing Excel file: ${(error as Error).message}`);
        }
      };
      reader.onerror = () => {
        setImpErr('Error reading file');
      };
      reader.readAsBinaryString(file);
    } else {
      setImpErr('Please upload a CSV or Excel file');
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  const processImport = (data: ImportedData[]): void => {
    const newEmails: string[] = [];
    let errCount = 0;

    if (!data.length) {
      setImpErr('No data found in the file');
      return;
    }

    const possibleCols = ['email', 'emailaddress', 'email_address', 'e-mail', 'mail', 'email address'];
    let emailCol: string | null = null;

    for (const key of Object.keys(data[0] || {})) {
      const lowerKey = key.toLowerCase().replace(/\s+/g, '');
      if (possibleCols.includes(lowerKey)) {
        emailCol = key;
        break;
      }
    }

    if (emailCol) {
      data.forEach(row => {
        const email = row[emailCol]?.toString().trim();
        if (email && valEmail(email) && !recips.includes(email)) {
          newEmails.push(email);
        } else if (email) {
          errCount++;
        }
      });
    } else {
      data.forEach(row => {
        let found = false;
        for (const key in row) {
          const value = row[key]?.toString().trim();
          if (value && valEmail(value) && !recips.includes(value)) {
            newEmails.push(value);
            found = true;
            break;
          }
        }
        if (!found) errCount++;
      });
    }

    if (newEmails.length > 0) {
      setRecips(prev => [...prev, ...newEmails]);
      setImpSuccess(`Imported ${newEmails.length} email${newEmails.length > 1 ? 's' : ''} successfully`);
      setTimeout(() => setImpSuccess(null), 3000);

      if (errCount > 0) {
        setImpErr(`Skipped ${errCount} invalid entries.`);
        setTimeout(() => setImpErr(null), 5000);
      }
    } else {
      setImpErr('No valid email addresses found in the file');
    }
  };

  const dispRecips = showAll ? recips : recips.slice(0, visRecips);

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setSubmitting(true);

    let scheduledAt = null;
    if (date && time) {
      const schedDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      schedDate.setHours(hours, minutes);
      scheduledAt = schedDate.toISOString();
    }

    try {
      const payload = {
        subject: subj,
        body,
        useHtml,
        recipients: recips,
        scheduledAt,
        attachments: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          content: file.content
        })),
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND as string}/schedule-mail/`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setShowConf(true);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setImpErr(`Error: ${error.response.data?.message || 'Failed to send email. Please try again.'}`);
      } else {
        setImpErr('Unable to connect to the server. Please check your internet connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = (): void => {
    setSubj("");
    setBody("");
    setUseHtml(false);
    setDate(undefined);
    setTime("");
    setFiles([]);
    setRecips([]);
    setShowAll(false);
    setShowConf(false);
  };

  const today = new Date();

  const renderTimeSelect = () => {
    const now = new Date();
    const currMin = now.getMinutes();
    const roundedMin = Math.ceil(currMin / 15) * 15;
    const minTime = new Date(now);
    minTime.setMinutes(roundedMin + 15);

    const filteredOpts = date && isSameDay(date, today)
      ? timeOpts.filter(t => {
        const [hours, minutes] = t.split(':').map(Number);
        const optTime = new Date(today);
        optTime.setHours(hours, minutes, 0, 0);
        return optTime >= minTime;
      })
      : timeOpts;

    return (
      <Select value={time} onValueChange={setTime} disabled={!date}>
        <SelectTrigger className="border-purple-200 hover:border-purple-400 flex-1 relative">
          <SelectValue placeholder="Select Time" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {filteredOpts.map((tOpt) => (
            <SelectItem key={tOpt} value={tOpt}>
              {fmtTime(tOpt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const fmtTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const isSameDay = (date1?: Date, date2?: Date): boolean => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const fmtDate = (date?: Date): string => {
    if (!date) return "Select Date";
    return format(date, "EEEE, MMMM d, yyyy");
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-purple-600 text-white py-4 px-6 rounded-t-lg shadow-md flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Mail className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-semibold">Compose Email</h1>
        </div>
        {!isValid && (
          <Badge variant="outline" className="bg-purple-700 text-white border-purple-400 px-3">
            <AlertCircle className="h-4 w-4 mr-1" />
            Complete required fields
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-purple-800 font-medium">
            Subject <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subject"
            value={subj}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSubj(e.target.value)}
            placeholder="Enter email subject"
            className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="body" className="text-purple-800 font-medium">
              Message Body <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="html-switch" className="text-purple-700 text-sm">Use HTML</Label>
              <Switch
                id="html-switch"
                checked={useHtml}
                onCheckedChange={setUseHtml}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          </div>
          <Textarea
            id="body"
            value={body}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
            placeholder={useHtml ? "<p>Enter your HTML content here</p>" : "Enter your message here"}
            className="min-h-40 border-purple-200 focus:border-purple-500 focus:ring-purple-500 font-mono"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-purple-800 font-medium">
            Recipients (BCC) <span className="text-red-500">*</span>
          </Label>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
            <div className="relative flex-grow">
              <Input
                ref={recipRef}
                value={newRecip}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setNewRecip(e.target.value);
                  setImpErr(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Add email address"
                className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 pr-24"
              />
              <Button
                type="button"
                onClick={addRecip}
                className="absolute right-0 top-0 h-full bg-purple-600 hover:bg-purple-700 rounded-l-none"
                disabled={!newRecip.trim()}
              >
                Add
              </Button>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <input
                      type="file"
                      ref={csvRef}
                      onChange={handleImportFile}
                      accept=".csv,.xlsx,.xls"
                      style={{ display: 'none' }}
                    />
                    <Button
                      type="button"
                      onClick={handleImportClick}
                      variant="outline"
                      className="border-purple-300 hover:bg-purple-100 text-purple-700 whitespace-nowrap flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-1" /> Import
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import emails from CSV or Excel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {impErr && (
            <div className="text-sm text-amber-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {impErr}
            </div>
          )}

          {impSuccess && (
            <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <Check className="h-3 w-3" /> {impSuccess}
            </div>
          )}
          {recips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {dispRecips.map((recipient, index) => (
                <Badge
                  key={index}
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1.5 flex items-center"
                >
                  {recipient}
                  <button
                    type="button"
                    onClick={() => rmRecip(recipient)}
                    className="ml-2 text-purple-600 hover:text-purple-800 h-4 w-4 flex items-center justify-center rounded-full hover:bg-purple-300"
                    aria-label={`Remove ${recipient}`}
                  >
                    &#215;
                  </button>
                </Badge>
              ))}

              {recips.length > visRecips && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleShowAll}
                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 px-2"
                >
                  {showAll ? (
                    <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
                  ) : (
                    <><ChevronDown className="h-4 w-4 mr-1" /> {recips.length - visRecips} More...</>
                  )}
                </Button>
              )}
            </div>
          )}

          {recips.length === 0 ? (
            <div className="text-sm text-amber-600 mt-1">Please add at least one recipient</div>
          ) : (
            <div className="text-sm text-purple-700 mt-1">{recips.length} recipient(s) added</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="files" className="text-purple-800 font-medium">Attachments</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => fileRef.current?.click()}
                variant="outline"
                className="border-purple-300 hover:bg-purple-100 text-purple-700 whitespace-nowrap flex-grow md:flex-grow-0"
              >
                <Upload className="h-4 w-4 mr-2" /> Select Files
              </Button>
              <Input
                id="files"
                ref={fileRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              {files.length > 0 && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3">
                  {files.length} file{files.length !== 1 ? 's' : ''} attached
                </Badge>
              )}
            </div>

            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {files.map((file, index) => (
                  <Badge
                    key={index}
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1.5 flex items-center gap-2"
                  >
                    <span className="max-w-48 truncate">{file.name}</span>
                    <span className="text-xs text-purple-500">{fmtSize(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => rmFile(file.name)}
                      className="ml-1 text-purple-600 hover:text-purple-800 h-4 w-4 flex items-center justify-center rounded-full hover:bg-purple-300"
                      aria-label={`Remove ${file.name}`}
                    >
                      &#215;
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-purple-800 font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" /> Schedule Delivery
          </Label>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date ?? undefined)}
              minDate={new Date()}
              placeholderText="Select Date"
              className="border border-purple-200 hover:border-purple-400 flex-1 rounded-md h-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              dateFormat="EEEE, MMMM d, yyyy"
              wrapperClassName="flex-1"
            />

            {renderTimeSelect()}
          </div>

          {date && time && schedValid && (
            <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <Check className="h-3 w-3" /> Email will be sent on {fmtDate(date)} at {fmtTime(time)}
            </div>
          )}

          {schedErr && (
            <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {schedErr}
            </div>
          )}
        </div>

        <Separator className="my-4 bg-purple-100" />

        <div className="flex justify-end pb-6">
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            disabled={!isValid || submitting}
          >
            {submitting ? 'Sending...' : date && time ? 'Schedule Email' : 'Send Email'}
          </Button>
        </div>
      </div>

      <AlertDialog open={showConf} onOpenChange={setShowConf}>
        <AlertDialogContent className="border-purple-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-purple-800 text-xl">Email Successfully {date && time ? 'Scheduled' : 'Sent'}</AlertDialogTitle>
            <AlertDialogDescription>
              {date && time ? (
                <>
                  Your email has been scheduled to send to {recips.length} recipient(s) on {fmtDate(date)} at {fmtTime(time)}.
                  <span className="block mt-4 p-4 bg-purple-50 rounded-md">
                    <span className="font-medium text-purple-800">Email Details</span>
                    <span className="block mt-2"><span className="font-medium">Subject:</span> {subj}</span>
                    <span className="block mt-1"><span className="font-medium">Recipients:</span> {recips.length} email(s)</span>
                    {files.length > 0 && (
                      <span className="block mt-1"><span className="font-medium">Attachments:</span> {files.length} file(s)</span>
                    )}
                  </span>
                </>
              ) : (
                <>
                  Your email has been sent to {recips.length} recipient(s).
                  <span className="block mt-4 p-4 bg-purple-50 rounded-md">
                    <span className="font-medium text-purple-800">Email Details</span>
                    <span className="block mt-2"><span className="font-medium">Subject:</span> {subj}</span>
                    <span className="block mt-1"><span className="font-medium">Recipients:</span> {recips.length} email(s)</span>
                    {files.length > 0 && (
                      <span className="block mt-1"><span className="font-medium">Attachments:</span> {files.length} file(s)</span>
                    )}
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-purple-600 hover:bg-purple-700"
              onClick={resetForm}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmailComposer;