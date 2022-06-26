/*
 * **********************************************
 * Printing result depth
 *
 * You can enlarge it, if needed.
 * **********************************************
 */
maximum_printing_depth(100).

:- current_prolog_flag(toplevel_print_options, A),
   (select(max_depth(_), A, B), ! ; A = B),
   maximum_printing_depth(MPD),
   set_prolog_flag(toplevel_print_options, [max_depth(MPD)|B]).

% Signature: unique(List, UniqueList, Dups)/3
% Purpose: succeeds if and only if UniqueList contains the same elements
% of List without duplicates (according to their order in List), and
% Dups contains the duplicate


member2(X, [X|_Ys]).
member2(X, [_Y|Ys]) :- member2(X, Ys).

unique([], [], []).
unique([X|List], [X|UniqueList], Dups) :- unique(List, UniqueList, Dups),(\+ member2(X, UniqueList)).
unique([X|List], UniqueList, [X|Dups]) :- unique(List, UniqueList, Dups), member2(X, UniqueList).













