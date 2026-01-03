console.log("Starting full import test...");
import express from 'express';
console.log("express imported");
import multer from 'multer';
console.log("multer imported");
import cors from 'cors';
console.log("cors imported");
import { Mistral } from '@mistralai/mistralai';
console.log("Mistral imported");
import fs from 'fs';
console.log("fs imported");
import path from 'path';
console.log("path imported");
import dotenv from 'dotenv';
console.log("dotenv imported");

dotenv.config();
console.log("dotenv config ran");
console.log("All imports successful!");
