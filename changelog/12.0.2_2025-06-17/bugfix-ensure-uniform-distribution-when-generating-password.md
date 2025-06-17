Bugfix: Ensure uniform distribution when generating password

Replaced the biased division-based random index generation with a method that ensures uniform distribution.
This can be achieved by using a rejection sampling approach, similar to the one used earlier in the `getRandomCharsFromSet` function.
Specifically, we will calculate a `setLimit` for the array length and discard random values that fall outside this range.
This ensures that the modulo operation produces unbiased results.

https://github.com/owncloud/web/pull/12575