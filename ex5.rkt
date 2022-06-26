#lang racket

(provide (all-defined-out))

(define id (lambda (x) x))
(define cons-lzl cons)
(define empty-lzl? empty?)
(define empty-lzl '())
(define head car)
(define tail
  (lambda (lzl)
    ((cdr lzl))))

;;; Q1.a
; Signature: compose(f g)
; Type: [T1 -> T2] * [T2 -> T3]  -> [T1->T3]
; Purpose: given two unary functions return their composition, in the same order left to right
; test: ((compose - sqrt) 16) ==> -4
;       ((compose not not) true)==> true
(define compose
  (lambda (f g)
    (lambda (x)
       (g (f x)))))


; Signature: pipe(lst-fun)
; Type: [[T1 -> T2],[T2 -> T3]...[Tn-1 -> Tn]]  -> [T1->Tn]
; Purpose: Returns the composition of a given list of unary functions. For (pipe (list f1 f2 ... fn)), returns the composition fn(....(f1(x)))
; test: ((pipe (list sqrt - - number?)) 16)) ==> true
;       ((pipe (list sqrt - - number? not)) 16) ==> false
;       ((pipe (list sqrt add1 - )) 100) ==> -11
(define pipe
  (lambda (fs)  
    (if (empty? (cdr fs))
        (car fs)
        (compose (car fs) (pipe (cdr fs))))))

; Signature: pipe$(lst-fun,cont)
;         [T1 * [T2->T3] ] -> T3,
;         [T3 * [T4 -> T5] ] -> T5,
;         ...,
;         [T2n-1 * [T2n * T2n+1]] -> T2n+1
;        ]
;       * 
;       [T2n+1 * [T2n+2 -> T2n+3]] -> T2n+3
;      -> [T1 * [T2n+3 -> T2n+4]] -> T2n+4
; Purpose: Returns the composition of a given list of unry CPS functions.

(define compose$
  (lambda (f g)
    (lambda (x con)
      (f x (lambda(res)( g res con ))))))


(define pipe$
(lambda (fs con)
        (if (empty? (cdr fs))
            (con (car fs))
            (pipe$ (cdr fs) (lambda(rest)(con(compose$ (car fs) rest)))))))

(define pipe1$
(lambda (fs con)
        (if (empty? (cdr fs))
            (con (car fs))
        (compose$ (car fs) (pipe1$ (cdr fs) con)))))


;;; Q1.c

; Signature: reduce-prim$(reducer, init, lst, cont)
; Type: @TODO
; Purpose: Returns the reduced value of the given list, from left 
;          to right, with cont post-processing
; Pre-condition: reducer is primitive
; test: (reduce-prim$ + 0 '( 8 2 2) (lambda (x) x))==> 15
;      (reduce-prim$ * 1 '(1 2 3 4 5) (lambda (x) x)) ==> 120
;      (reduce-prim$ - 1 '(1 2 3 4 5) (lambda (x) x))==> -14

(define reduce-prim$
  (lambda (reducer init lst cont)
            (if (empty? (cdr lst))
            (cont (reducer init (car lst)))
            (reduce-prim$ reducer init (cdr lst) (lambda (rest) (cont (reducer rest (car lst))))))))

; Signature: reduce-user$(reducer, init, lst, cont)
; Type: @TODO
; Purpose: Returns the reduced value of the given list, from left 
;          to right, with cont post-processing
; Pre-condition: reducer is a CPS user prococedure
; test: (reduce-user$ plus$ 0 '(3 8 2 2) (lambda (x) x)) ==> 15
;        (reduce-user$ div$ 100 '(5 4 1) (lambda (x) (* x 2))) ==> -14

(define reduce-user$
  (lambda (reducer init lst cont)
         (if (empty? (cdr lst))
            (reducer init (car lst) cont)
            (reduce-user$ reducer init (cdr lst) (lambda (rest) (reducer rest (car lst) cont))))))

;;; Q2.c.1
; Signature: take1(lz-lst,pred)
; Type: [LzL<T>*[T -> boolean] -> List<T>]
; Purpose: while pred holds return the list elments
; Tests: (take-while (integers-from 0) (lambda (x) (< x 9)))==>'(0 1 2 3 4 5 6 7 8)
;          (take-while(integers-from 0) (lambda (x)  (= x 128))))==>'()
(define take-while
  (lambda (lst pred)
    (if (empty-lzl? lst)
        '()
        (if (pred (head lst))
           (cons (head lst) (take-while (tail lst) pred) )
           '()))))
        
        

;;; Q2.c.2
; Signature: take-while-lzl(lz-lst,pred)
; Type: [LzL<T>*[T -> boolean] -> Lzl<T>]
; Purpose: while pred holds return list elments as a lazy list
; Tests: (take (take-while-lzl (integers-from 0) (lambda (x) (< x 9))) 10) ==>'(0 1 2 3 4 5 6 7 8)
;           (take-while-lzl(integers-from 0) (lambda (x)  (= x 128))))==>'()

(define take-while-lzl
  (lambda (lst pred)
    (if (>= (take-while-lzl-help lst pred -1) 0)
        (take-from-lst lst 0 (+ (take-while-lzl-help lst pred -1) 1))
        empty-lzl)))


(define take-while-lzl-help
  (lambda (lst pred n)
    (if (empty-lzl? lst)
          n
          (if (pred (head lst))
              (take-while-lzl-help (tail lst) pred (+ n 1))
              n ))))

(define take-from-lst
  (lambda (lst n k)
      (if(and (< n k) (>= n 0))
         (cons-lzl (head lst) (lambda () (take-from-lst (tail lst) (+ n 1) k)))
         empty-lzl) ))

;;; Q2.d
; Signature: reduce-lzl(reducer, init, lzl)
; Type: @TODO
; Purpose: Returns the reduced value of the given lazy list
(define reduce-lzl
  (lambda (reducer init lzl)
    (if(empty-lzl? lzl)
       init
       (reducer (reduce-lzl reducer init (tail lzl)) (head lzl)))))



