import {  Exp, isLetPlusExp, makeLetExp, Program } from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import * as L from "./L31-ast";
import * as R from "ramda";
import { Console } from "console";
import { isCompoundExp, unparseL3 } from "../imp/L3-ast";
import { cons } from "../shared/list";
import exp from "constants";
import { join } from "path";

/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l30ToJS = (exp: Exp | Program): Result<string>  => 
L.isExp(exp) ? makeOk(forCEXP(rewriteAllLetExp(exp))) :
L.isProgram(exp) ? makeOk(R.map( forCEXP,L.makeProgram(R.map(rewriteAllLetExp, exp.exps)).exps).reduce(forProg, "").substring(2)) :
makeFailure("no need");

const forProg=(total:string, now:string):string=>total+join(";\n")+now;


/*
Purpose: rewrite a single LetExp as a lambda-application form
Signature: rewriteLet(cexp)
Type: [LetExp => AppExp]
*/const rewriteLet = (e: L.LetExp): L.AppExp => {
    const vars : L.VarDecl[] = R.map((b) => b.var, e.bindings);
    const vals : L.CExp[] = R.map((b) => b.val, e.bindings);
    return L.makeAppExp(
            L.makeProcExp(vars, e.body),
            vals);
}

/*
Purpose: rewrite all occurrences of let in an expression to lambda-applications.
Signature: rewriteAllLet(exp)
Type: [Program | Exp -> Program | Exp]
*/
export const rewriteAllLet = (exp: Program | Exp): Program | Exp =>
    L.isExp(exp) ? rewriteAllLetExp(exp) :
    L.isProgram(exp) ? L.makeProgram(R.map(rewriteAllLetExp, exp.exps)) :
    exp;

const rewriteAllLetExp = (exp: Exp): Exp =>
    L.isCExp(exp) ? rewriteAllLetCExp(exp) :
    L.isDefineExp(exp) ? L.makeDefineExp(exp.var, rewriteAllLetCExp(exp.val)) :
    exp;

const rewriteAllLetCExp = (exp: L.CExp): L.CExp =>
    L.isAtomicExp(exp) ? exp :
    L.isLitExp(exp) ? exp :
    L.isIfExp(exp) ? L.makeIfExp(rewriteAllLetCExp(exp.test),
                             rewriteAllLetCExp(exp.then),
                             rewriteAllLetCExp(exp.alt)) :
    L.isAppExp(exp) ? L.makeAppExp(rewriteAllLetCExp(exp.rator),
                               R.map(rewriteAllLetCExp, exp.rands)) :
    L.isProcExp(exp) ? L.makeProcExp(exp.args, R.map(rewriteAllLetCExp, exp.body)) :
    L.isLetExp(exp) ? rewriteAllLetCExp(rewriteLet(exp)) :
    exp;


const forCEXP=(exp: L.Exp):string=>
L.isStrExp(exp) ? forStr(exp):
L.isVarRef(exp) ? L.unparseL31(exp):
L.isNumExp(exp) ? L.unparseL31(exp): 
L.isBoolExp(exp) ? L.unparseL31(exp):
L.isPrimOp(exp) ?
((exp.op =="number?") ? "((x) => (typeof (x) === number))":
(exp.op =="boolean?") ? "((x) => (typeof (x) === boolean))":
(exp.op =="symbol?") ? "((x) => (typeof (x) === symbol))":
(exp.op =="string?") ? "((x) => (typeof (x) === string))":L.unparseL31(exp)):
L.isIfExp(exp) ? forIfExp(exp) :
L.isDefineExp(exp) ? forDefExp(exp):
L.isProcExp(exp) ? forLambdaExp(exp):
L.isAppExp(exp) ? forAppExp(exp):
L.isLitExp(exp) ? forLitExp(exp):
L.unparseL31(exp);
//used for vals

const forLitExp=(exp:L.LitExp):string=>"Symbol.for("+L.unparseL31(exp).substring(1)+")";
const f=(total:string, now:L.VarDecl):string=>total+','+now.var;

const f2=(total:string, now:L.CExp):string=>total+','+forCEXP(now);

const f3=(total:string, now:L.CExp):string=>
total+' '+forCEXP(now)+' '+total.charAt(0);

const f4=(total:string, now:L.CExp):string=>
total+' '+forCEXP(now)+' '+total.substring(0, 4);

const f5=(total:string, now:L.CExp):string=>
total+forCEXP(now)+total.charAt(0);

const f6=(total:string, now:L.CExp):string=>
total+' '+forCEXP(now)+' '+total.substring(0, 3);
//
const forIfExp=(exp:L.IfExp):string=>'('+forCEXP(exp.test)+" ? "+forCEXP(exp.then)+" : "+forCEXP(exp.alt)+')';

const forDefExp=(exp:L.DefineExp):string=>"const "+exp.var.var+" = "+forCEXP(exp.val);

const forLambdaExp=(exp: L.ProcExp):string=>'(('+exp.args.reduce(f,"").substring(1)+") => "+exp.body.reduce(f2,"").substring(1)+')';



const forAppExp=(exp:L.AppExp):string=>
    L.isAtomicExp(exp.rator) ? forAtomicExp(exp.rator, exp.rands):
    forCEXP(exp.rator)+'('+exp.rands.reduce(f2, "").substring(1)+')';

const forAtomicExp=(exp:L.AtomicExp, arr: L.CExp[]):string=>
L.isNumExp(exp) ? L.unparseL31(exp):
L.isStrExp(exp) ? forStr(exp):
L.isVarRef(exp) ? exp.var+'('+arr.reduce(f2,"").substring(1)+')':
L.isBoolExp(exp) ? "":
forPrimOp(exp, arr);

const forStr=(exp:L.StrExp):string=>
L.unparseL31(exp);

const forPrimOp=(exp:L.PrimOp,  arr: L.CExp[]):string=>
(exp.op =="=") ? '('+arr.reduce(f4, "===").substring(4, arr.reduce(f4, "===").length-5)+')':
(exp.op =="not") ? '('+arr.reduce(f5, '!').substring(0, arr.reduce(f5, '!').length-1)+')':
(exp.op =="and") ? '('+arr.reduce(f6, '&&').substring(3, arr.reduce(f6, '&&').length-4)+')':
(exp.op =="or") ? '('+arr.reduce(f6, '||').substring(3, arr.reduce(f6, '!!').length-4)+')':
(exp.op =="string=?") ? '('+arr.reduce(f4, "===").substring(4, arr.reduce(f4, "===").length-5)+')':
'('+arr.reduce(f3, L.unparseL31(exp)).substring(2, arr.reduce(f3, L.unparseL31(exp)).length-2)+')';
