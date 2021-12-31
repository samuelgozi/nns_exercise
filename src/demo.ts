import { RequestAnalyzer } from "./RequestAnalyzer.js";

const uuidMatcher = {
  patternName: "uuid",
  urlString: "{UUID}",
  isMatch(value: string): boolean {
    return !!value.match(
      /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/
    );
  },
};

const intMatcher = {
  patternName: "int",
  urlString: "{INT}",
  isMatch(value: string): boolean {
    return !!value.match(/^\d+$/);
  },
};

const categoryMatcher = {
  patternName: "category",
  urlString: "{CATEGORY}",
  isMatch(value: string): boolean {
    // In the real world this would've been a dictionary + stemming, or some word embedding module
    return ["computers", "tvs", "bikes", "toys", "toasters"].some(
      (c) => c == value
    );
  },
};

function baseCase() {
  const urls = [
    "www.example.com/shop/9638e3a7-c2e3-4985-9f9c-172867e6c9f8",
    "www.example.com/shop/5d56aed0-9e99-4d01-8e05-ee7c8fa933d6",
    "www.example.com/shop/e6b0683d-a6cd-4a7d-8f08-d88c1a3e747b",
    "www.example.com/shop/8317b5bf-9d2c-4d2a-aa8b-e7720fed0960",
    "www.example.com/shop/0e444f1b-ab50-45be-9299-c0d592e4f674",
    "www.example.com/shop/aa433081-dc06-42b2-8826-200263220fc4",
    "www.example.com/shop/617321d1-ee3f-4034-bf1c-8286e90838cd",
    "www.example.com/shop/f677d53e-857e-4dff-b680-6bb1aff018e8",
    "www.example.com/shop/5c0a4a95-c237-43e9-8734-f6200a0cd815",
    "www.example.com/shop/226f61f4-9e2c-4f8b-b757-ce123e422cf2",
  ];

  const ra = new RequestAnalyzer();
  ra.registerIPatternRecognizer(uuidMatcher);

  for (const url of urls) {
    ra.addRequestUrl(url);
  }

  console.log(JSON.stringify(ra.getAnalyzedRoutes()));
}

function complication1() {
  const urls = [
    "www.example.com/shop/tvs",
    "www.example.com/shop/computers",
    "www.example.com/shop/bikes",
    "www.example.com/shop/toys",
    "www.example.com/shop/toasters",
    "www.example.com/shop/grooming",
    "www.example.com/shop/cleaning",
    "www.example.com/shop/consoles",
    "www.example.com/shop/gardening",
  ];

  const ra = new RequestAnalyzer();
  ra.registerIPatternRecognizer(uuidMatcher);

  for (const url of urls) {
    ra.addRequestUrl(url);
  }

  console.log(JSON.stringify(ra.getAnalyzedRoutes()));
}

function complication1_1() {
  const urls = [
    "www.example.com/shop/tvs/9638e3a7-c2e3-4985-9f9c-172867e6c9f8",
    "www.example.com/shop/computers/5d56aed0-9e99-4d01-8e05-ee7c8fa933d6",
    "www.example.com/shop/bikes/e6b0683d-a6cd-4a7d-8f08-d88c1a3e747b",
    "www.example.com/shop/toys/8317b5bf-9d2c-4d2a-aa8b-e7720fed0960",
    "www.example.com/shop/toasters/0e444f1b-ab50-45be-9299-c0d592e4f674",
    "www.example.com/shop/tvs/f677d53e-857e-4dff-b680-6bb1aff018e8",
    "www.example.com/shop/computers/226f61f4-9e2c-4f8b-b757-ce123e422cf2",
    "www.example.com/shop/bikes/226f61f4-9e2c-4f8b-b757-ce123e422cf2",
    "www.example.com/shop/toys/ba01d42e-9ad2-4b7d-a1e0-4c2d1c0ba033",
  ];

  const ra = new RequestAnalyzer();
  ra.registerIPatternRecognizer(uuidMatcher);

  for (const url of urls) {
    ra.addRequestUrl(url);
  }

  console.log(JSON.stringify(ra.getAnalyzedRoutes()));
}

function complication2() {
  const urls = [
    "www.example.com/shop/tvs/9638e3a7-c2e3-4985-9f9c-172867e6c9f8",
    "www.example.com/shop/computers/5d56aed0-9e99-4d01-8e05-ee7c8fa933d6",
    "www.example.com/shop/bikes/e6b0683d-a6cd-4a7d-8f08-d88c1a3e747b",
    "www.example.com/shop/all",
    "www.example.com/shop/toasters/0e444f1b-ab50-45be-9299-c0d592e4f674",
    "www.example.com/shop/tvs/f677d53e-857e-4dff-b680-6bb1aff018e8",
    "www.example.com/shop/all",
    "www.example.com/shop/all",
    "www.example.com/shop/toys/ba01d42e-9ad2-4b7d-a1e0-4c2d1c0ba033",
  ];

  const ra = new RequestAnalyzer();
  ra.registerIPatternRecognizer(uuidMatcher);

  for (const url of urls) {
    ra.addRequestUrl(url);
  }

  console.log(JSON.stringify(ra.getAnalyzedRoutes()));
}

// Option 1 - keep differant categories as differant "functions"
function complication3() {
  const urls = [
    "www.example.com/shop/tvs/9638e3a7-c2e3-4985-9f9c-172867e6c9f8/images",
    "www.example.com/shop/computers/5d56aed0-9e99-4d01-8e05-ee7c8fa933d6",
    "www.example.com/shop/bikes/e6b0683d-a6cd-4a7d-8f08-d88c1a3e747b/images",
    "www.example.com/shop/toys/8317b5bf-9d2c-4d2a-aa8b-e7720fed0960",
    "www.example.com/shop/toasters/0e444f1b-ab50-45be-9299-c0d592e4f674",
    "www.example.com/shop/tvs/f677d53e-857e-4dff-b680-6bb1aff018e8/images",
    "www.example.com/shop/computers/226f61f4-9e2c-4f8b-b757-ce123e422cf2",
    "www.example.com/shop/bikes/226f61f4-9e2c-4f8b-b757-ce123e422cf2",
    "www.example.com/shop/toys/ba01d42e-9ad2-4b7d-a1e0-4c2d1c0ba033/images",
  ];

  const ra = new RequestAnalyzer();
  ra.registerIPatternRecognizer(uuidMatcher);

  for (const url of urls) {
    ra.addRequestUrl(url);
  }

  console.log(JSON.stringify(ra.getAnalyzedRoutes()));
}
complication3();

// Option 2 - mark category as a param (just add another recognizer)
function complication3Option2() {
  const urls = [
    "www.example.com/shop/tvs/9638e3a7-c2e3-4985-9f9c-172867e6c9f8/images",
    "www.example.com/shop/computers/5d56aed0-9e99-4d01-8e05-ee7c8fa933d6",
    "www.example.com/shop/bikes/e6b0683d-a6cd-4a7d-8f08-d88c1a3e747b/images",
    "www.example.com/shop/toys/8317b5bf-9d2c-4d2a-aa8b-e7720fed0960",
    "www.example.com/shop/toasters/0e444f1b-ab50-45be-9299-c0d592e4f674",
    "www.example.com/shop/tvs/f677d53e-857e-4dff-b680-6bb1aff018e8/images",
    "www.example.com/shop/computers/226f61f4-9e2c-4f8b-b757-ce123e422cf2",
    "www.example.com/shop/bikes/226f61f4-9e2c-4f8b-b757-ce123e422cf2",
    "www.example.com/shop/toys/ba01d42e-9ad2-4b7d-a1e0-4c2d1c0ba033/images",
  ];

  const ra = new RequestAnalyzer();
  ra.registerIPatternRecognizer(uuidMatcher);
  ra.registerIPatternRecognizer(categoryMatcher);

  for (const url of urls) {
    ra.addRequestUrl(url);
  }

  console.log(JSON.stringify(ra.getAnalyzedRoutes()));
}

complication3Option2();

// Skipped complication 4, this handles both
// Option 1 - keep differant categories as differant "functions"
function complication5() {
  const urls = [
    "www.example.com/shop?category=tvs&limit=10",
    "www.example.com/shop?category=computers",
    "www.example.com/shop?category=bikes",
    "www.example.com/shop?category=toys&limit=11",
    "www.example.com/shop?category=toasters",
    "www.example.com/shop?category=tvs&limit=20",
    "www.example.com/shop?category=computers",
    "www.example.com/shop?category=bikes&limit=1",
    "www.example.com/shop?category=toys",
  ];

  const ra = new RequestAnalyzer();
  ra.registerIPatternRecognizer(uuidMatcher);
  ra.registerIPatternRecognizer(intMatcher);

  for (const url of urls) {
    ra.addRequestUrl(url);
  }

  console.log(JSON.stringify(ra.getAnalyzedRoutes()));
}

complication5();

// Option 2 - mark category as a param (just add another recognizer)
function complication5Option2() {
  const urls = [
    "www.example.com/shop?category=tvs&limit=10",
    "www.example.com/shop?category=computers",
    "www.example.com/shop?category=bikes",
    "www.example.com/shop?category=toys&limit=11",
    "www.example.com/shop?category=toasters",
    "www.example.com/shop?category=tvs&limit=20",
    "www.example.com/shop?category=computers",
    "www.example.com/shop?category=bikes&limit=1",
    "www.example.com/shop?category=toys",
  ];

  const ra = new RequestAnalyzer();
  ra.registerIPatternRecognizer(uuidMatcher);
  ra.registerIPatternRecognizer(intMatcher);
  ra.registerIPatternRecognizer(categoryMatcher);

  for (const url of urls) {
    ra.addRequestUrl(url);
  }

  console.log(JSON.stringify(ra.getAnalyzedRoutes()));
}

complication5Option2();
