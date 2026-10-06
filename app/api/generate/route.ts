import { inputSchema } from "@/lib/validation/schemas";
import { createProvider } from "@/lib/ai/provider";
import { GenerationError } from "@/lib/ai/types";
import { orchestrate } from "@/lib/agents/orchestrator";
export const runtime="nodejs";
export const maxDuration=300;
export async function POST(request:Request){
 const origin=request.headers.get("origin");
 // Next.js can normalise request.url to localhost behind a proxy. Compare the
 // browser Origin with the actual Host header instead of that internal URL.
 if(origin){
  try {if(new URL(origin).host!==(request.headers.get("host") || new URL(request.url).host)) return Response.json({error:"Cross-origin generation requests are not allowed."},{status:403});}
  catch {return Response.json({error:"Invalid request origin."},{status:403});}
 }
 if(Number(request.headers.get("content-length") ?? 0)>16000) return Response.json({error:"Please keep the input brief."},{status:413});
 let raw:unknown;
 try {const body=await request.text(); if(body.length>16000) return Response.json({error:"Please keep the input brief."},{status:413}); raw=JSON.parse(body);} catch {return Response.json({error:"Please provide a valid teaching request."},{status:400});}
 const parsed=inputSchema.safeParse(raw);
 if(!parsed.success) return Response.json({error:"Check your lesson details and enter a learning objective of 10–600 characters."},{status:400});
 let ai; try {ai=createProvider();} catch(error){return Response.json({error:error instanceof GenerationError ? error.message : "AI configuration needs attention."},{status:503});}
 const encoder=new TextEncoder();
 const stream=new ReadableStream({async start(controller){
  const send=(event:unknown)=>controller.enqueue(encoder.encode(JSON.stringify(event)+"\n"));
  try{const result=await orchestrate(parsed.data,ai,stage=>send({event:"stage",stage})); send({event:"result",result});}
  catch(error){send({event:"error",error:error instanceof GenerationError ? error.message : "We couldn’t generate the material this time. Please try again."});}
  finally{controller.close();}
 }});
 return new Response(stream,{headers:{"Content-Type":"application/x-ndjson","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
