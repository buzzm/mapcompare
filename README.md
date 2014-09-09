mapcompare
==========

Javascript object comparison utility.

See mongocompare.test.js for examples...

```
diffs = MapCompare.diff(itemA, itemB)

 Given two items A and B where A and B can be null or a
 string, number, object, array, or Date, compare and produce
 an array containing objects each with 4 elements:
 path:  A dot notation path in the structure where the diff
        occurred.  Will be "" if a scalar type is supplied 
        for A and B
 type:  A string enum, one of the following:
        MapCompare.DiffType.DIFFERENT_VALUE
        MapCompare.DiffType.DIFFERENT_TYPE
        MapCompare.DiffType.LIST_IN_A_LONGER
        MapCompare.DiffType.LIST_IN_B_LONGER
        MapCompare.DiffType.NULL_IN_A
        MapCompare.DiffType.NULL_IN_B
 aval:  value in A that caused diff with B
 bval:  value in B that caused diff with A

 Objects are walked depth-first.  The order of the keys is
 not defined and no specific order should be assumed.
 After checking for length equality, the shorter of arrays
 A and B will be walked.
```
