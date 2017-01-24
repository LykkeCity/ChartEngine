var allTestFiles = []
var TEST_REGEXP = /(spec|test)\.js$/i

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')
    allTestFiles.push(normalizedTestModule)
  }
})

console.log(allTestFiles);

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  paths: {
    "jquery": 'test/lib/jquery'
    // '/base/src/lib/ChartType.js': '/base/src/lib/core/ChartType.js',

    // 'src/lib/shared': 'src/lib/shared/index',
    // 'src/lib/core': 'src/lib/core/index',
    // 'src/lib/core/*': 'src/lib/core/',
    //  '../shared': 'src/lib/shared/index',
    //  '../core': 'src/lib/core/index',
    //  '../data': 'src/lib/data/index',
    //  '../utils': 'src/lib/utils/index',
     //"src/lib/core/index": 'src/lib/core/index',
    // 'src/lib/data': 'src/lib/data/index',
    // 'src/lib/model': 'src/lib/model/index'
      // charts: 'charts',
      // core: 'charts/core',
      // data: 'charts/data',
      // shared: 'charts/shared'
      //jquery: '/scripts/jquery-3.1.1'
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
})
