
/**
 *  Why ANOTHER Map diff util?  Especally when google guava is out there
 *  with all kinds of Map utils?  Because this one tells you the differences
 *  expressed as dotpaths and is a little more informative of the diffs. 
 *  Exploiting the module anonymous function thing here.  Docs appear javadoc
 *  style with the methods you can call.
 */
var MapCompare = (function() {
	var my = {};
	var locals = {};

	my.DiffType = {
	    DIFFERENT_VALUE: "DIFFERENT_VALUE",
	    DIFFERENT_TYPE: "DIFFERENT_TYPE",
	    LIST_IN_A_LONGER: "LIST_IN_A_LONGER",
	    LIST_IN_B_LONGER: "LIST_IN_B_LONGER",
	    NULL_IN_A: "NULL_IN_A",
	    NULL_IN_B: "NULL_IN_B"
	};


	appendDiff = function(currentPath, difftype, ov_a, ov_b) {
	    if(locals.failFast == true) {
		locals.exitNow = true;

	    } else {
		var nd = {};
		nd.path = currentPath;
		nd.type = difftype;
		nd.aval = ov_a;
		nd.bval = ov_b;
		locals.ld.push(nd);
	    }
	}


	processItem = function(path, a, b) {

	    if(a instanceof Array && b instanceof Array) {
		walkList(path, a, b);

	    } else if(a instanceof Date && b instanceof Date) {
		if( ! (b.getTime() == a.getTime()) ) {
		    appendDiff(path, my.DiffType.DIFFERENT_VALUE, a, b);
		}

	    } else if(a instanceof Object && b instanceof Object) {
		walkMap(path, a, b);

	    } else { 
		a_c = typeof(a);
		b_c = typeof(b);

		if(!(a_c == b_c)) {
		    appendDiff(path, my.DiffType.DIFFERENT_TYPE, a, b);
		} else {
		    if( ! (b == a) ) {
			appendDiff(path, my.DiffType.DIFFERENT_VALUE, a, b);
		    }
		}
	    }
	}

	preProcessItem = function(currentPath, nkey, ov_a, ov_b) {
	    var ncp = "";

	    if(currentPath.length == 0) {
		ncp = nkey;
	    } else {
		ncp = currentPath + "." + nkey; 
	    }

	    if(ov_a == null && ov_b != null) {
		appendDiff(ncp, my.DiffType.NULL_IN_A, ov_a, ov_b);
	    } else if(ov_a != null && ov_b == null) {
		appendDiff(ncp, my.DiffType.NULL_IN_B, ov_a, ov_b);
	    } else {
		processItem(ncp, ov_a, ov_b);	    
	    }
	}

	walkMap = function(currentPath, a, b) {

	    var k_combined = {};

	    Object.keys(a).forEach(function(x){k_combined[x] = 1;});
	    Object.keys(b).forEach(function(x){k_combined[x] = 1;});

	    Object.keys(k_combined).every(function(key) {
		
		    var ov_a = a[key]; // OK to be null
		    var ov_b = b[key]; // OK to be null

		    preProcessItem(currentPath, key, ov_a, ov_b);

		    return !locals.exitNow;
		});
	}


	walkList = function(currentPath, a, b) {
	    var na = a.length;
	    var nb = b.length;
	    
	    /** 
	     *  Unlike Maps, where the key from one does a lookup into
	     *  the other WITH NO ASSUMPTION about order, Lists are all
	     *  about order.  List size matters!
	     */
	    if(na > nb) {
		appendDiff(currentPath, my.DiffType.LIST_IN_A_LONGER, a, b);
	    } else if(na < nb) {
		appendDiff(currentPath, my.DiffType.LIST_IN_B_LONGER, a, b);
	    }

	    /**
	     *  Even if lengths are different, let's walk them and find
	     *  out some more information.  But don't overrun!
	     */
	    var c = na < nb ? na : nb; // na = nb, then take nb; no prob

	    for(var jj = 0; jj < c; jj++) {
		ov_a = a[jj];
		ov_b = b[jj];

		preProcessItem(currentPath, ("" + jj), ov_a, ov_b);

		if(locals.exitNow == true) {
		    break;
		}
	    }
	}


	/**
	 * diffs = MapCompare.diff(itemA, itemB)
	 *
	 * Given two items A and B where A and B can be null or a
	 * string, number, object, array, or Date, compare and produce
	 * an array containing objects each with 4 elements:
	 * path:  A dot notation path in the structure where the diff
	 *        occurred.  Will be "" if a scalar type is supplied 
	 *        for A and B
	 * type:  A string enum, one of the following:
	 *        MapCompare.DiffType.DIFFERENT_VALUE
	 *        MapCompare.DiffType.DIFFERENT_TYPE
	 *        MapCompare.DiffType.LIST_IN_A_LONGER
	 *        MapCompare.DiffType.LIST_IN_B_LONGER
	 *        MapCompare.DiffType.NULL_IN_A
	 *        MapCompare.DiffType.NULL_IN_B
	 * aval:  value in A that caused diff with B
	 * bval:  value in B that caused diff with A
	 *
	 * Objects are walked depth-first.  The order of the keys is
	 * not defined and no specific order should be assumed.
	 * After checking for length equality, the shorter of arrays
	 * A and B will be walked.
	 */
	my.diff = function(a,b) {
	    locals = {};
	    locals.failFast = false;
	    locals.ld = [];

	    preProcessItem("", "", a, b);

	    return locals.ld;
	}

	/**
	 * diffs = MapCompare.diffQuick(itemA, itemB)
	 *
	 * Same logic as diff() but will bail out and return true when
	 * the first diff is encountered, else it will continue to walk 
	 * the structures, eventually returning false meaning no diffs
	 * found.
	 */
	my.diffQuick = function(a,b) {
	    locals = {};
	    locals.failFast = true;
	    locals.exitNow = false;
	    locals.ld = [];

	    preProcessItem("", "", a, b);

	    return locals.exitNow;
	}

	return my;
}());

