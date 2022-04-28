import {  Exp, isLetPlusExp, makeLetExp, Program } from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import * as L from "./L31-ast";
import * as R from "ramda";
import { Console } from "console";
import { unparseL3 } from "../imp/L3-ast";
import { cons } from "../shared/list";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
L.isExp(exp) ?makeOk(rewriteAllLetExp(exp) ):
L.isProgram(exp) ? makeOk(L.makeProgram(R.map(rewriteAllLetExp, exp.exps)) ):
makeFailure("no need");


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
    L.isLetExp(exp) ? L.makeLetExp(R.map(rewriteVals, exp.bindings), R.map(rewriteAllLetCExp, exp.body)) :
    L.isLetPlusExp(exp) ? rewriteAllLetCExp(rewriteLet(exp)) :
    exp;

const rewriteVals=(e: L.Binding): L.Binding=>
    L.makeBinding(e.var.var,rewriteAllLetCExp(e.val))


const rewriteLet = (e: L.LetPlusExp): L.AppExp => {
        const vars : L.VarDecl[] = R.map((b) => b.var, e.bindings);
        const vals : L.CExp[] = R.map((b) => b.val, e.bindings);
        return L.makeAppExp(
                L.makeProcExp(vars, e.body),
                vals);
    }
    
