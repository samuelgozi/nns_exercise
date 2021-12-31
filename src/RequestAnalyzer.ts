export interface IUrlPart {
  value: string;
  type: string;
  position: string;
  childern: IUrlPart[];
}

export interface IPatternRecognizer {
  patternName: string;
  urlString: string;
  isMatch(value: string): boolean;
}

export class Route {
  host: string;
  path: string;
  constructor(host: string, path: string) {
    this.host = host;
    this.path = path;
  }
}

export class RequestAnalyzer {
  private treeRoot: IUrlPart;
  private patternRecognizers: IPatternRecognizer[] = [];

  private initTreeRoot(host: string) {
    this.treeRoot = {
      value: host,
      type: "host",
      position: "host",
      childern: [],
    };
  }

  public registerIPatternRecognizer(patternRecognizer: IPatternRecognizer) {
    this.patternRecognizers.push(patternRecognizer);
  }

  // getPatten tries to match the given url part with a known patten
  private getPatten(value: string): { type: string; value: string } {
    // First, try to find a matching known pattern
    for (const pattern of this.patternRecognizers) {
      if (pattern.isMatch(value)) {
        return { type: "var", value: pattern.urlString };
      }
    }

    // Couldn't find a patten, return the original value
    return { type: "static", value: value };
  }

  private handlePart(
    currentNode: IUrlPart,
    pathPartType: string,
    pathPartValue: string,
    position: string
  ): IUrlPart {
    const existingChild = currentNode.childern.find(
      (child) => child.value == pathPartValue
    );
    if (!!existingChild) {
      // A child with this path already exists
      return existingChild;
    } else {
      // Doesn't exist, add a new child

      // if this node already has a terminator, it means we saw it without this param
      // so mark the query param as optional and remove the terminator
      // this assumes that they params are ordered in the request, so not 100%, but good enough for the excersize

      if (currentNode.childern.some((c) => c.type == "terminator")) {
        position += "Optional";
        currentNode.childern = currentNode.childern.filter(
          (c) => c.position != "terminator"
        );
      }

      const newNode: IUrlPart = {
        value: pathPartValue,
        type: pathPartType,
        childern: [],
        position: position,
      };
      currentNode.childern.push(newNode);
      return newNode;
    }
  }

  // handleUrlSegments takes the path and the query parts of the url, and adds it to the
  // representation tree as either static value or a matched var pattern
  private handleUrlSegments(path: string, searchParams: URLSearchParams) {
    const pathParts = path.split("/").filter((s) => s != "");

    let currentNode = this.treeRoot;
    for (const pathPart of pathParts) {
      const { type, value } = this.getPatten(pathPart);
      currentNode = this.handlePart(currentNode, type, value, "path");
    }

    if (searchParams.toString() != "") {
      for (const param of searchParams) {
        const [paramName, paramValue] = param;
        const { type, value } = this.getPatten(paramValue);
        const fullValue = `${paramName}=${value}`;
        currentNode = this.handlePart(currentNode, type, fullValue, "query");
      }
    }

    // if this node has children, that means
    // that we saw a url without those params, so mark them as optional and don't add a terminator
    // this assumes that they params are ordered "required first" in the request, so not 100% correct
    // but good enough for the excersize? ¯\_(ツ)_/¯

    if (currentNode.childern.some((c) => c.position != "terminator")) {
      currentNode.childern.forEach((c) => {
        c.position += "Optional";
      });
    }

    // Add a terminator, if there aren't other children
    if (currentNode.childern.length == 0) {
      currentNode.childern.push({
        value: "",
        type: "terminator",
        position: "terminator",
        childern: [],
      });
    }
  }

  // addes a url to the analyzer
  // splits into host and parts of path
  public addRequestUrl(url: string) {
    // make sure parsing doesn't crash due to missing protocol
    if (!url.startsWith("http://")) {
      url = "http://" + url;
    }

    const parsedUrl = new URL(url);
    if (this.treeRoot == null) {
      this.initTreeRoot(parsedUrl.host);
    }

    this.handleUrlSegments(parsedUrl.pathname, parsedUrl.searchParams);
  }

  // getUrlString gets the string representation the the url part
  // marks the part as optional in output by surrounding with (? )
  private getUrlString(urlPart: IUrlPart): string {
    let seperator = "/";

    // Again, this only works for the excersize
    // in the "real world" we'll have to figure out which one is first
    if (urlPart.position == "query") {
      seperator = "?";
    } else if (urlPart.position == "queryOptional") {
      seperator = "&";
    }

    let value = urlPart.value;
    if (urlPart.position.endsWith("Optional")) {
      value = `(?${value})`;
    }

    return `${seperator}${value}`;
  }
  // fillRoutes takes a url part, and adds it to the output representation
  // recuresively considers all children
  private fillRoutes(urlPart: IUrlPart, route: Route): Route[] {
    if (urlPart.type == "terminator") {
      // no children, we only return ourself
      return [route];
    } else {
      let results: Route[] = [];
      route.path += this.getUrlString(urlPart);

      for (const child of urlPart.childern) {
        // copy so we get a differant path for each child
        const routeCopy = new Route(route.host, route.path);
        // run recursively for each child
        results = results.concat(this.fillRoutes(child, routeCopy));
      }
      return results;
    }
  }

  // getAnalyzedRoutes builds a generic uri representation with /static/{pattern}?param={pattern} structure
  // Similar logic can be used to build other outputs
  public getAnalyzedRoutes(): Route[] {
    let results: Route[] = [];
    const baseRoute = new Route(this.treeRoot.value, "");

    for (const child of this.treeRoot.childern) {
      // copy so we get a differant path for each child
      const route = new Route(baseRoute.host, baseRoute.path);

      // run recursively for each child
      results = results.concat(this.fillRoutes(child, route));
    }
    return results;
  }
}
