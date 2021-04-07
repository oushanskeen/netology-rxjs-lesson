import { fromEvent, of, from } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import {
  switchMap,
  catchError,
  filter,
  debounceTime,
  distinctUntilChanged,
  mergeMap,
  map
} from "rxjs/operators";

// select observable DOM elements and relevant action
const selectObservableElement = id => document.getElementById(id);
const makeObservableBox = watchIt => fromEvent(watchIt, "input");

// element 1
const observeInputOne = selectObservableElement("inputOne");
const githubInput = makeObservableBox(observeInputOne);
// element 2
const observeInputTwo = selectObservableElement("inputTwo");
const gitlabInput = makeObservableBox(observeInputTwo);

// urls
const githubRequestUri = `https://api.github.com/search/repositories?q=`;
const gitlabRequestUri = `https://gitlab.com/api/v4/projects?search=`;

// request function
const makeSearchRequest = uri => request => `${uri}${request}`;

const githubRequest = makeSearchRequest(githubRequestUri);
const gitlabRequest = makeSearchRequest(gitlabRequestUri);

// fetch function
const fetchPipe = action =>
  switchMap((event: KeyboardEvent) => {
    return fetch(` ${action((event.target as HTMLInputElement).value)}`).then(
      res => res.json()
    );
  });

// useless filter
const filterPipe = () => filter(v => Object.keys(v).length > 5);

// universl observable factory
const searchObservable = (observableElement, observableAction) =>
  observableElement
    .pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      fetchPipe(observableAction),
      map(value => JSON.stringify(value))
    )
    .subscribe({
      next: res => console.log(res),
      error: console.log
    });

// trigger observable subscription
searchObservable(githubInput, githubRequest);
searchObservable(gitlabInput, gitlabRequest);
