import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { createProvider } from "../lib/ai/provider";
const schema=z.object({message:z.string()});
test("provider refuses missing secret and insecure URLs, and validates compatible protocol",async()=>{
 const before={provider:process.env.AI_PROVIDER,key:process.env.AI_API_KEY,base:process.env.AI_BASE_URL,model:process.env.AI_MODEL};const oldFetch=globalThis.fetch;
 try {
  delete process.env.AI_API_KEY;process.env.AI_PROVIDER="deepseek";assert.throws(()=>createProvider(),/awaiting an API key/);
  process.env.AI_API_KEY="test-only-not-a-real-key";process.env.AI_BASE_URL="http://example.com";assert.throws(()=>createProvider(),/configuration/);
  process.env.AI_BASE_URL="https://example.com/v1";process.env.AI_MODEL="test-model";
  globalThis.fetch=async(url,init)=>{assert.equal(String(url),"https://example.com/v1/chat/completions");assert.ok((init?.headers as Record<string,string>).Authorization.startsWith("Bearer "));const body=JSON.parse(String(init?.body));assert.equal(body.model,"test-model");assert.deepEqual(body.response_format,{type:"json_object"});assert.ok(body.messages[0].content.includes('JSON schema'));assert.ok(!body.messages[0].content.includes(process.env.AI_API_KEY));return Response.json({choices:[{message:{content:'{"message":"valid draft"}'}}]});};
  assert.deepEqual(await createProvider().generate("Follow the schema.",{input:"anonymous"},schema),{message:"valid draft"});
  globalThis.fetch=async()=>new Response("provider secret detail",{status:401});await assert.rejects(()=>createProvider().generate("test",{},schema),/provider could not complete/);
  globalThis.fetch=async()=>{throw new DOMException("test","TimeoutError");};await assert.rejects(()=>createProvider().generate("test",{},schema),/took too long/);
  globalThis.fetch=async()=>Response.json({choices:[{message:{content:'{"wrong":true}'}}]});await assert.rejects(()=>createProvider().generate("test",{},schema),/invalid draft/);
 }finally{globalThis.fetch=oldFetch;for(const [name,value]of Object.entries({AI_PROVIDER:before.provider,AI_API_KEY:before.key,AI_BASE_URL:before.base,AI_MODEL:before.model})){if(value===undefined)delete process.env[name];else process.env[name]=value;}}
});
