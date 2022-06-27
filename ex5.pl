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

notMember(_X, []).
notMember(X, [Y|Ys]):- (X =\= Y), notMember(X, Ys).


unique(List, UniqueList, Dups) :- uniqueHelp([], List, UniqueList, Dups).

uniqueHelp(_AllList, [], [], []).
uniqueHelp(AllList, [X|List], [X|UniqueList], Dups) :- uniqueHelp([X|AllList], List, UniqueList, Dups), notMember(X, AllList).
uniqueHelp(AllList, [X|List], UniqueList, [X|Dups]) :- uniqueHelp(AllList, List, UniqueList, Dups), member2(X, AllList).















