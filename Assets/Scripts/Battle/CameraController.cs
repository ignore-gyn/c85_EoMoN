using UnityEngine;
using System.Collections;

public class CameraController : MonoBehaviour {

	private Transform target;

	// ターゲットまでの距離
	private float height = 10f;
	private float distance = 8f;

/*
	private float min = 10f;
	private float max = 60f;

	// Rotation
	private float rotateSpeed = 1f;

	// Zoom
	private float zoomStep = 30f;
	private float zoomSpeed = 5f;

	private float heightWanted = height;
	private float distanceWanted = distance;

	// Result
	private Vector3 zoomResult;
	private Quaternion rotateResult;
	private Vector3 targetPosition;
*/

	void Start () {
		target = transform.parent;
		// * ToDo: Rotation setting
		transform.position = new Vector3(target.position.x, height, -distance);
	}

	void LateUpdate () {
		if (!target) {
			return;
		}

		transform.LookAt(target);
	}
}
