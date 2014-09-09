/***
 *   This could probably be ... better....
 *
 *   -Buzz Moschetti, buzz@mongodb.com, Sep 2014
 */

load("/Users/buzz/js/lib/mapcompare.js");

chk = function(desc, key, expected, got) {
    var ok = true;

    if(expected[key] != null) { // OK to not attempt test for match
	if(expected[key] != got[key]) {
	    print(desc + ": ERROR: expected " + key + " " + expected[key] + ", got " + got[key]);
	    ok = false;
	}
    }
    return ok;
}

wrapper = function(tlist) {
    tlist.forEach(function(tt) {
	    var desc = tt[0];
	    var m1 = tt[1];
	    var m2 = tt[2];
	    var exp = tt[3];
	    if(!desc.startsWith("#")) {
		test(desc, m1, m2, exp);
	    } else {
		print("skip " + desc);
	    }
	});
}

test = function(desc,m1,m2, expected) {
    var ok = true;
    var r = MapCompare.diff(m1,m2);

    if(expected == null && r.length > 0) {
	print(desc + ": ERROR: expected no diffs but got:");
	printjson(r);
	ok = false;
    } else if(expected != null && r.length == 0) {
	print(desc + ": ERROR: expected diffs but got none");
	ok = false;

    } else if(expected != null && r.length > 0) {
	r.forEach(function(got) {
		var exp = expected[got.path];
		if(exp == null) {
		    print(desc + ": ERROR: got unexpected diff on path [" + got.path + "]");
		    ok = false;
		} else {
		    ["type","aval","bval"].forEach(function(k){
			    if(chk(desc, k, exp, got) == false) {
				ok = false;
			    }
			});

		    exp["processed"] = true;
		}
		//print(a.path + ": " + a.type);
		//printjson(a);
	    });

	// Now go back and see if any expected items were NOT processed...
	Object.keys(expected).forEach(function(path) {
		var exp = expected[path];
		if(exp.processed != true) {
		    print(desc + ": ERROR: expected diff on path [" + path + "] but got none");
		    ok = false;
		}
	    });
    }

    if(ok) {
	print(desc + ": ok");
    }
}


wrapper( [
       [ "sanity check; simple yields no diffs", 
	 {"A":"A"},
	 {"A":"A"},
         null
	 ]

       ,[ "all null!",
	 null,
	 null,
         null
	 ]

       ,[ "string diff",
	  "A",
	  "B",
	  {
	      "": {"type": MapCompare.DiffType.DIFFERENT_VALUE}
	  }
	 ]


       ,[ "basic list diff", 
	  {"A":"A", "B": [0    ,1  ]},
	  {"A":"A", "B": ["foo",0,1]},
	  {
	   "B": {"type": MapCompare.DiffType.LIST_IN_B_LONGER},
	   "B.0": {"type": MapCompare.DiffType.DIFFERENT_TYPE},
	   "B.1": {"type": MapCompare.DiffType.DIFFERENT_VALUE}
	  }
	 ]

       ,[ "deep nest diff", 
	  {"A": { "B": { "C": { "D": { "E": { "F": "G1" }}}}}},
	  {"A": { "B": { "C": { "D": { "E": { "F": "G2" }}}}}},
	  {
	      "A.B.C.D.E.F": {"type": MapCompare.DiffType.DIFFERENT_VALUE}
	  }
	 ]

       ,[ "simple array #1", 
          [ 0 ],
          [ 0 ],
	  null
	 ]

       ,[ "simple array #2", 
          [ 0 ],
          [ 1 ],
	  {
	      "0": {"type": MapCompare.DiffType.DIFFERENT_VALUE}
	  }	  
	 ]

       ,[ "simple array #3", 
          [ 0 ],
          [ "A", 2 ],
	  {
	      "": {"type": MapCompare.DiffType.LIST_IN_B_LONGER},
	      "0": {"type": MapCompare.DiffType.DIFFERENT_TYPE, "aval": 0, "bval": "A"}
	  }	  
	 ]

       ,[ "array in array no diff", 
          [ 0, [ 1, [ 2, [ 3, "foo", { "A": "bar" } ] ] ] ],
          [ 0, [ 1, [ 2, [ 3, "foo", { "A": "bar" } ] ] ] ],
	  null
	 ]

       ,[ "array in array some diffs", 
          [ 0, [ 1, [ 2, [ 3, "foo", "v1", { "A": "bar" } ], 6, 7 ] ] ],
          [ 0, [ 1, [ 2, [ 3, "foo", "v2", { "A": "baz" } ], 6, 7 ] ] ],
	  {
	      "1.1.1.2": {"type": MapCompare.DiffType.DIFFERENT_VALUE},
	      "1.1.1.3.A": {"type": MapCompare.DiffType.DIFFERENT_VALUE}
	  }
	 ]

       ,[ "date no diff", 
          { "d1": new Date("2014-07-07"), "d2": new Date("2012-07-07")},
	  { "d1": new Date("2014-07-07"), "d2": new Date("2012-07-07")},
         null
	 ]


       ,[ "date #1", 
          { "d1": new Date("2014-07-07"), "d2": new Date("2012-07-07")},
	  { "d1": new Date("2014-07-07"), "d2": new Date("2013-07-07")},
	  {
	      "d2": {"type": MapCompare.DiffType.DIFFERENT_VALUE}
	  }
	 ]

       ,[ "date #2", 
          { "d1": null,                      "d2": new Date("2012-07-07")},
	  { "d1": new Date("2014-07-07"), "d2": "corn"},
	  {
	      "d1": {"type": MapCompare.DiffType.NULL_IN_A},
	       "d2": {"type": MapCompare.DiffType.DIFFERENT_TYPE}
	  }
	 ]

       ,[ "Date v. ISODate", 
          { "d1": new ISODate("2011-03-03") },
	  { "d1": new    Date("2011-03-03") },
	  null
	 ]

       ,[ "doubles no diff", 
          { "d1": 3.14159 },
          { "d1": 3.14159 },
	  null
	 ]

       ,[ "doubles #1", 
          { "d1": 3.14159 },
          { "d1": 3.14158 },
	  {
	      "d1": {"type": MapCompare.DiffType.DIFFERENT_VALUE}
	  }
	 ]

       ,[ "grand poobah #1", 
       { "kB": { "kC": "valueC",
                 "kD": "valueD",
                 "kE": [ "foo", { "zA": "q1" }, 12, "clink" ]
               },
         "kA": "valueA"
	     },
       { "kA": "valueA", 
         "kB": { "kC": "valueC",
                 "kD": "notValueD",
                 "kE": [ "goo", { "zA": "q2", "zB": "q3" }, 12, "bar", 44 ]
               },
         "kF": 7
	     },

	  {
	      "kF": {"type": MapCompare.DiffType.NULL_IN_A},
	      "kB.kD": {"type": MapCompare.DiffType.DIFFERENT_VALUE},
	      "kB.kE": {"type": MapCompare.DiffType.LIST_IN_B_LONGER},
	      "kB.kE.0": {"type": MapCompare.DiffType.DIFFERENT_VALUE},
	      "kB.kE.1.zA": {"type": MapCompare.DiffType.DIFFERENT_VALUE},
	      "kB.kE.1.zB": {"type": MapCompare.DiffType.NULL_IN_A},
	      "kB.kE.3": {"type": MapCompare.DiffType.DIFFERENT_VALUE}
	  }
	 ]
       
	  ]);

