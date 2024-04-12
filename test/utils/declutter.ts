import { ApiComponent, ApiData, ApiEndpoint, ApiSchema, ApiService, OptionalProperties } from '@goast/core';
import * as util from 'util';

export function declutterApiData(data: ApiData) {
  for (const schema of data.schemas) {
    declutterSchema(schema);
  }
  for (const endpoint of data.endpoints) {
    declutterEndpoint(endpoint);
  }
  for (const service of data.services) {
    declutterService(service);
  }
}

export function declutterSchema(schema: ApiSchema) {
  declutterApiComponent(schema);

  if (schema.discriminator) {
    for (const m in schema.discriminator.mapping) {
      (schema.discriminator.mapping as any)[m] = schema.discriminator.mapping[m].id;
    }
  }

  if ('properties' in schema) {
    for (const p of schema.properties?.keys() ?? []) {
      const prop = schema.properties.get(p);
      if (prop?.schema) {
        (prop as any).schema = prop.schema.id;
      }
    }
  }
  if ('allOf' in schema) {
    (schema as any).allOf = schema.allOf.map((s) => s.id);
  }
  if ('anyOf' in schema) {
    (schema as any).anyOf = schema.anyOf.map((s) => s.id);
  }
  if ('oneOf' in schema) {
    (schema as any).oneOf = schema.oneOf.map((s) => s.id);
  }
  if ('inheritedSchemas' in schema) {
    (schema as any).inheritedSchemas = schema.inheritedSchemas.map((s) => s.id);
  }
}

export function declutterEndpoint(endpoint: ApiEndpoint) {
  declutterApiComponent(endpoint);
  for (const param of endpoint.parameters) {
    if (param.schema) {
      (param as any).schema = param.schema.id;
    }
  }
  for (const content of endpoint.requestBody?.content ?? []) {
    if (content.schema) {
      (content as any).schema = content.schema.id;
    }
  }
  for (const response of endpoint.responses) {
    for (const header of response.headers) {
      if (header.schema) {
        (header as any).schema = header.schema.id;
      }
    }
    for (const content of response.contentOptions) {
      if (content.schema) {
        (content as any).schema = content.schema.id;
      }
    }
  }
}

export function declutterService(service: ApiService) {
  declutterApiComponent(service);
  (service as any).endpoints = service.endpoints.map((e) => e.id);
}

export function declutterApiComponent(component: OptionalProperties<ApiComponent<any>, '$src'>) {
  if (component.$src) {
    (component.$src as any).document = inspectCountMsg(component.$src.document);
    (component.$src as any).component = inspectCountMsg(component.$src.component);
    (component.$src as any).originalComponent = inspectCountMsg(component.$src.originalComponent);
  }
  if (component.$ref) {
    (component as any).$ref = component.$ref.id;
  }
}

function inspectCountMsg(obj: unknown): string {
  return `${util.inspect(obj, { depth: 1000 }).length} inspect chars`;
}
