import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface Operation {
  summary?: string;
  description?: string;
  parameters?: Array<{
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    required?: boolean;
    schema: {
      type: string;
    };
  }>;
  responses: {
    [statusCode: string]: {
      description: string;
      content?: {
        [mediaType: string]: {
          schema: {
            type: string;
          };
        };
      };
    };
  };
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
}

interface SwaggerDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths: {
    [path: string]: PathItem;
  };
}

export class Documentation {
  public router: Router;
  public swaggerDocument: SwaggerDocument;

  constructor() {
    this.router = Router();
    this.swaggerDocument = this.loadSwaggerDocument();
    this.init();
  }

  private loadSwaggerDocument(): SwaggerDocument {
    const filePath = path.join(__dirname, './to-do-app-be.swagger.yaml');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContent) as SwaggerDocument;
  }

  private init(): void {
    this.router.use(swaggerUi.serve);
    this.router.get('/', swaggerUi.serve, swaggerUi.setup(this.swaggerDocument));
  }
}
